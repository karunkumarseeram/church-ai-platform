from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user, admin_required
from app.models.chr_models import Donation, AdminActionLog
from app.schemas.donation import DonationCreate, DonationOut, PaymentMethod
from datetime import datetime

router = APIRouter(prefix="/donations", tags=["Donations"])


def log_admin_action(
    db: Session,
    admin_id: str,
    action: str,
    ip_address: str = None
):
    """Log admin actions for audit trail"""
    log_entry = AdminActionLog(
        admin_id=admin_id,
        action=action,
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()


# Create donation
@router.post("/", response_model=DonationOut)
async def create_donation(
    donation: DonationCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new donation"""
    try:
        new_donation = Donation(
            user_id=current_user.id if hasattr(current_user, 'id') else None,
            donor_name=donation.donor_name,
            amount=donation.amount,
            payment_method=donation.payment_method,
            transaction_id=donation.transaction_id,
            location=request.client.host if request.client else None,
            ip_address=request.client.host if request.client else None
        )

        db.add(new_donation)
        db.commit()
        db.refresh(new_donation)

        return new_donation

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating donation: {str(e)}")


# Get all donations (Admin only)
@router.get("/", response_model=List[DonationOut])
async def get_donations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    """Get all donations (Admin only)"""
    donations = db.query(Donation).offset(skip).limit(limit).all()
    return donations


# Get user's own donations
@router.get("/my-donations", response_model=List[DonationOut])
async def get_my_donations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get current user's donations"""
    donations = db.query(Donation).filter(Donation.user_id == current_user.id).all()
    return donations


# Get donation by ID
@router.get("/{donation_id}", response_model=DonationOut)
async def get_donation(
    donation_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific donation"""
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    # Users can only see their own donations unless they're admin
    if str(donation.user_id) != str(current_user.id) and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied")

    return donation


# Update donation status (Admin only)
@router.put("/{donation_id}/status")
async def update_donation_status(
    donation_id: str,
    status: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    """Update donation status (Admin only)"""
    try:
        donation = db.query(Donation).filter(Donation.id == donation_id).first()
        if not donation:
            raise HTTPException(status_code=404, detail="Donation not found")

        old_status = donation.status
        donation.status = status
        db.commit()

        # Log admin action
        log_admin_action(
            db=db,
            admin_id=str(current_user.id),
            action=f"Updated donation status: {donation.donor_name} - ₹{donation.amount} ({old_status} → {status})",
            ip_address=request.client.host if request.client else None
        )

        return {"message": "Donation status updated successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating donation: {str(e)}")


# Delete donation (Admin only)
@router.delete("/{donation_id}")
async def delete_donation(
    donation_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    """Delete a donation (Admin only)"""
    try:
        donation = db.query(Donation).filter(Donation.id == donation_id).first()
        if not donation:
            raise HTTPException(status_code=404, detail="Donation not found")

        donation_info = f"{donation.donor_name} - ₹{donation.amount}"

        db.delete(donation)
        db.commit()

        # Log admin action
        log_admin_action(
            db=db,
            admin_id=str(current_user.id),
            action=f"Deleted donation: {donation_info}",
            ip_address=request.client.host if request.client else None
        )

        return {"message": "Donation deleted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting donation: {str(e)}")


# Get donation statistics
@router.get("/stats/summary")
async def get_donation_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    """Get donation statistics (Admin only)"""
    total_donations = db.query(Donation).count()
    total_amount = db.query(Donation).filter(Donation.status == "SUCCESS").with_entities(Donation.amount).all()
    total_amount = sum(amount[0] for amount in total_amount)

    # Monthly stats for current year
    current_year = datetime.now().year
    monthly_stats = {}
    for month in range(1, 13):
        month_start = datetime(current_year, month, 1)
        if month == 12:
            month_end = datetime(current_year + 1, 1, 1)
        else:
            month_end = datetime(current_year, month + 1, 1)

        monthly_amount = db.query(Donation).filter(
            Donation.donated_at >= month_start,
            Donation.donated_at < month_end,
            Donation.status == "SUCCESS"
        ).with_entities(Donation.amount).all()
        monthly_amount = sum(amount[0] for amount in monthly_amount)
        monthly_stats[month] = monthly_amount

    return {
        "total_donations": total_donations,
        "total_amount": total_amount,
        "monthly_stats": monthly_stats,
        "currency": "INR"
    }
# from app.core.database import SessionLocal
# from app.models.chr_models import User, RoleEnum
# from app.core.security import hash_password
# from app.core.config import settings
# import uuid

# db = SessionLocal()

# admin_email = "karunkumarseeram@gmail.com"
# admin_password = "SuperSecretPassword123!"

# existing = db.query(User).filter(User.email == admin_email).first()
# if existing:
#     print("Admin already exists")
# else:
#     new_admin = User(
#         id=uuid.uuid4(),
#         name="Admin",
#         email=admin_email,
#         phone="1234567890",
#         hashed_password=hash_password(admin_password),
#         role=RoleEnum.ADMIN,
#         is_active=True,
#         is_approved=True
#     )
#     db.add(new_admin)
#     db.commit()
#     print("✅ Admin created successfully")
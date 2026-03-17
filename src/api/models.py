from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user")
    
    classes = relationship("GymClass", back_populates="trainer", cascade="all, delete-orphan")
    routines = relationship("Routine", back_populates="trainer", cascade="all, delete-orphan")
    favorites_routines = relationship("Favorites_Routines", back_populates="user", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
        }

    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).first()

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)


class GymClass(db.Model):
    __tablename__ = "gym_class"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    time: Mapped[str] = mapped_column(String(20), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    level: Mapped[str] = mapped_column(String(50), nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=True)
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)

    trainer_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    trainer = relationship("User", back_populates="classes")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "date": self.date,
            "time": self.time,
            "duration": self.duration,
            "capacity": self.capacity,
            "level": self.level,
            "location": self.location,
            "image_url": self.image_url,
            "trainer_id": self.trainer_id,
            "trainer_email": self.trainer.email if self.trainer else None
        }


class Routine(db.Model):
    __tablename__ = "routine"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    goal: Mapped[str] = mapped_column(String(120), nullable=False)
    level: Mapped[str] = mapped_column(String(50), nullable=False)
    estimated_time: Mapped[int] = mapped_column(Integer, nullable=False)
    exercises: Mapped[str] = mapped_column(Text, nullable=False)
    muscle_group: Mapped[str] = mapped_column(String(50), nullable=True)

    trainer_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    trainer = relationship("User", back_populates="routines")
    favorites_routines = relationship("Favorites_Routines", back_populates="routine", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "goal": self.goal,
            "level": self.level,
            "estimated_time": self.estimated_time,
            "exercises": self.exercises,
            "muscle_group": self.muscle_group,
            "trainer_id": self.trainer_id,
            "trainer_email": self.trainer.email if self.trainer else None
        }


class Favorites_Routines(db.Model):
    __tablename__ = "favorites_routines"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    routine_id: Mapped[int] = mapped_column(ForeignKey("routine.id"), nullable=False)

    user = relationship("User", back_populates="favorites_routines")
    routine = relationship("Routine", back_populates="favorites_routines")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "routine_id": self.routine_id,
            "routine_name": self.routine.name if self.routine else None
        }
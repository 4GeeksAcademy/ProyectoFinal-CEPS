from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default="user")

    name: Mapped[str] = mapped_column(String(120), nullable=True)
    fitness_goals: Mapped[str] = mapped_column(Text, nullable=True)
    fitness_level: Mapped[str] = mapped_column(
        String(50), nullable=True, default="principiante")
    birth_date: Mapped[str] = mapped_column(String(20), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    avatar_url: Mapped[str] = mapped_column(String(255), nullable=True)

    classes = relationship(
        "GymClass", back_populates="trainer", cascade="all, delete-orphan")
    routines = relationship(
        "Routine", back_populates="trainer", cascade="all, delete-orphan")
    favorites_routines = relationship(
        "Favorites_Routines", back_populates="user", cascade="all, delete-orphan")
    favorites_classes = relationship(
        "Favorites_Classes", back_populates="user", cascade="all, delete-orphan")
    assigned_routines = relationship(
        "Assigned_Routines", back_populates="user", cascade="all, delete-orphan", foreign_keys="Assigned_Routines.user_id")
    assigned_classes = relationship(
        "Assigned_Classes", back_populates="user", cascade="all, delete-orphan", foreign_keys="Assigned_Classes.user_id")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "name": self.name,
            "fitness_goals": self.fitness_goals,
            "fitness_level": self.fitness_level,
            "birth_date": self.birth_date,
            "phone": self.phone,
            "avatar_url": self.avatar_url,
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

    trainer_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False)
    trainer = relationship("User", back_populates="classes")
    favorites_classes = relationship(
        "Favorites_Classes", back_populates="gym_class", cascade="all, delete-orphan")
    assigned_classes = relationship(
        "Assigned_Classes", back_populates="gym_class", cascade="all, delete-orphan")

    def serialize(self):
        occupied_slots = len(self.assigned_classes)
        available_slots = self.capacity - occupied_slots

        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "date": self.date,
            "time": self.time,
            "duration": self.duration,
            "capacity": self.capacity,
            "occupied_slots": occupied_slots,
            "available_slots": available_slots,
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

    trainer_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False)
    trainer = relationship("User", back_populates="routines")
    favorites_routines = relationship(
        "Favorites_Routines", back_populates="routine", cascade="all, delete-orphan")
    assigned_routines = relationship(
        "Assigned_Routines", back_populates="routine", cascade="all, delete-orphan")

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
    routine_id: Mapped[int] = mapped_column(
        ForeignKey("routine.id"), nullable=False)

    user = relationship("User", back_populates="favorites_routines")
    routine = relationship("Routine", back_populates="favorites_routines")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "routine_id": self.routine_id,
            "routine": self.routine.serialize() if self.routine else None
        }


class Favorites_Classes(db.Model):
    __tablename__ = "favorites_classes"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    class_id: Mapped[int] = mapped_column(
        ForeignKey("gym_class.id"), nullable=False)

    user = relationship("User", back_populates="favorites_classes")
    gym_class = relationship("GymClass", back_populates="favorites_classes")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "class_id": self.class_id,
            "class_title": self.gym_class.title if self.gym_class else None
        }


class Assigned_Routines(db.Model):
    __tablename__ = "assigned_routines"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    routine_id: Mapped[int] = mapped_column(
        ForeignKey("routine.id"), nullable=False)
    assigned_by: Mapped[int] = mapped_column(ForeignKey(
        "user.id"), nullable=False)
    assigned_date: Mapped[str] = mapped_column(String(20), nullable=True)

    user = relationship(
        "User", back_populates="assigned_routines", foreign_keys=[user_id])
    routine = relationship("Routine", back_populates="assigned_routines")
    trainer = relationship("User", foreign_keys=[assigned_by])

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "routine_id": self.routine_id,
            "assigned_by": self.assigned_by,
            "assigned_date": self.assigned_date,
            "routine": self.routine.serialize() if self.routine else None,
            "trainer_name": self.trainer.name if self.trainer else None
        }


class Assigned_Classes(db.Model):
    __tablename__ = "assigned_classes"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    class_id: Mapped[int] = mapped_column(
        ForeignKey("gym_class.id"), nullable=False)
    assigned_by: Mapped[int] = mapped_column(ForeignKey(
        "user.id"), nullable=False)
    assigned_date: Mapped[str] = mapped_column(String(20), nullable=True)

    user = relationship(
        "User", back_populates="assigned_classes", foreign_keys=[user_id])
    gym_class = relationship("GymClass", back_populates="assigned_classes")
    trainer = relationship("User", foreign_keys=[assigned_by])

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "class_id": self.class_id,
            "assigned_by": self.assigned_by,
            "assigned_date": self.assigned_date,
            "class": self.gym_class.serialize() if self.gym_class else None,
            "trainer_name": self.trainer.name if self.trainer else None,
            "user_name": self.user.name if self.user else None,
            "user_email": self.user.email if self.user else None
        }
    

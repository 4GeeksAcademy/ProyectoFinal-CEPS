from flask import request, jsonify, Blueprint
from api.models import db, User, GymClass, Routine, Favorites_Routines, Favorites_Classes, Assigned_Routines, Assigned_Classes, Exercise
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api = Blueprint("api", __name__)
CORS(api)


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


@api.route("/hello", methods=["POST", "GET"])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200


@api.route("/signup", methods=["POST"])
def signup():
    body = request.get_json()

    if not body:
        return jsonify({"msg": "Body vacío"}), 400

    email = body.get("email")
    password = body.get("password")
    role = body.get("role", "user")

    if not email or not password:
        return jsonify({"msg": "Email y password son requeridos"}), 400

    if len(password) < 6:
        return jsonify({"msg": "La contraseña debe tener al menos 6 caracteres"}), 400

    if role not in ["user", "trainer"]:
        return jsonify({"msg": "Rol inválido"}), 400

    existing_user = User.get_by_email(email)
    if existing_user:
        return jsonify({"msg": "El usuario ya existe"}), 409

    new_user = User(
        email=email,
        is_active=True,
        role=role
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "msg": "Usuario creado exitosamente",
        "user": new_user.serialize()
    }), 201


@api.route("/login", methods=["POST"])
def login():
    body = request.get_json()

    if not body:
        return jsonify({"msg": "Body vacío"}), 400

    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y password son requeridos"}), 400

    user = User.get_by_email(email)

    if not user or not user.check_password(password):
        return jsonify({"msg": "Credenciales inválidas"}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "msg": "Login exitoso",
        "token": access_token,
        "user": user.serialize()
    }), 200


@api.route("/private", methods=["GET"])
@jwt_required()
def private():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify({
        "msg": "Acceso autorizado",
        "user": user.serialize()
    }), 200


@api.route("/classes", methods=["POST"])
@jwt_required()
def create_class():
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden crear clases"}), 403

    body = request.get_json()

    if not body:
        return jsonify({"msg": "Body vacío"}), 400

    required_fields = [
        "title", "description", "category",
        "date", "time", "duration", "capacity", "level"
    ]

    for field in required_fields:
        if not body.get(field):
            return jsonify({"msg": f"El campo '{field}' es requerido"}), 400

    try:
        duration_val = int(body.get("duration"))
        capacity_val = int(body.get("capacity"))
    except ValueError:
        return jsonify({"msg": "La duración y la capacidad deben ser números enteros válidos"}), 400

    new_class = GymClass(
        title=body.get("title"),
        description=body.get("description"),
        category=body.get("category"),
        date=body.get("date"),
        time=body.get("time"),
        duration=duration_val,
        capacity=capacity_val,
        level=body.get("level"),
        location=body.get("location"),
        image_url=body.get("image_url"),
        trainer_id=current_user.id
    )

    db.session.add(new_class)
    db.session.commit()

    return jsonify({
        "msg": "Clase creada exitosamente",
        "class": new_class.serialize()
    }), 201


@api.route("/classes", methods=["GET"])
def get_classes():
    classes = GymClass.query.all()
    return jsonify([gym_class.serialize() for gym_class in classes]), 200


@api.route("/classes/<int:class_id>", methods=["GET"])
def get_class(class_id):
    gym_class = GymClass.query.get(class_id)

    if not gym_class:
        return jsonify({"msg": "Clase no encontrada"}), 404

    return jsonify(gym_class.serialize()), 200


@api.route("/classes/<int:class_id>/assigned-users", methods=["GET"])
@jwt_required()
def get_class_assigned_users(class_id):
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    gym_class = GymClass.query.get(class_id)

    if not gym_class:
        return jsonify({"msg": "Clase no encontrada"}), 404

    assigned = Assigned_Classes.query.filter_by(class_id=class_id).all()

    return jsonify([item.serialize() for item in assigned]), 200


@api.route("/routines", methods=["POST"])
@jwt_required()
def create_routine():
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden crear rutinas"}), 403

    body = request.get_json()

    if not body:
        return jsonify({"msg": "Body vacío"}), 400

    required_fields = [
        "name", "description", "goal",
        "level", "estimated_time", "exercises", "muscle_group"
    ]

    for field in required_fields:
        if not body.get(field):
            return jsonify({"msg": f"El campo '{field}' es requerido"}), 400

    new_routine = Routine(
        name=body.get("name"),
        description=body.get("description"),
        goal=body.get("goal"),
        level=body.get("level"),
        estimated_time=int(body.get("estimated_time")),
        muscle_group=body.get("muscle_group"),
        trainer_id=current_user.id
    )

    # Asignar relación N:M si enviaron lista de IDs de ejercicios
    exercises_ids = body.get("exercises", [])
    if isinstance(exercises_ids, list) and len(exercises_ids) > 0:
        selected_exercises = Exercise.query.filter(
            Exercise.id.in_(exercises_ids)).all()
        new_routine.exercises = selected_exercises

    db.session.add(new_routine)
    db.session.commit()

    return jsonify({
        "msg": "Rutina creada exitosamente",
        "routine": new_routine.serialize()
    }), 201


@api.route("/routines", methods=["GET"])
def get_routines():
    routines = Routine.query.all()
    return jsonify([routine.serialize() for routine in routines]), 200


@api.route("/routines/<int:routine_id>", methods=["GET"])
def get_routine(routine_id):
    routine = Routine.query.get(routine_id)

    if not routine:
        return jsonify({"msg": "Rutina no encontrada"}), 404

    return jsonify(routine.serialize()), 200


@api.route("/my-classes", methods=["GET"])
@jwt_required()
def my_classes():
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden ver sus clases"}), 403

    classes = GymClass.query.filter_by(trainer_id=current_user.id).all()
    return jsonify([gym_class.serialize() for gym_class in classes]), 200


@api.route("/my-routines", methods=["GET"])
@jwt_required()
def my_routines():
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden ver sus rutinas"}), 403

    routines = Routine.query.filter_by(trainer_id=current_user.id).all()
    return jsonify([routine.serialize() for routine in routines]), 200


@api.route("/favorites_routines/<int:routine_id>", methods=["POST"])
@jwt_required()
def add_favotites_routines(routine_id):
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "user":
        return jsonify({"msg": "Solo los usuarios pueden agregar rutinas a favoritos"}), 403

    routine = Routine.query.get(routine_id)

    if not routine:
        return jsonify({"msg": "Rutina no encontrada"}), 404

    if Favorites_Routines.query.filter_by(user_id=current_user.id, routine_id=routine_id).first():
        return jsonify({"msg": "Rutina ya agregada a favoritos"}), 400

    new_routine = Favorites_Routines(
        user_id=current_user.id,
        routine_id=routine_id
    )

    try:
        db.session.add(new_routine)
        db.session.commit()
        return jsonify({
            "msg": "Rutina agregada a favoritos exitosamente",
            "routine": new_routine.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "msg": "Error al agregar rutina a favoritos",
            "error": str(e)
        }), 500


@api.route("/favorites_routines/<int:routine_id>", methods=["DELETE"])
@jwt_required()
def delete_routines(routine_id):
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "user":
        return jsonify({"msg": "Solo los usuarios pueden eliminar rutinas"}), 403

    favorite = Favorites_Routines.query.filter_by(
        user_id=current_user.id,
        routine_id=routine_id
    ).first()

    if not favorite:
        return jsonify({"msg": "No tienes esta rutina agregada a favoritos"}), 404

    try:
        db.session.delete(favorite)
        db.session.commit()
        return jsonify({"msg": "Rutina eliminada exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar la rutina"}), 500


@api.route("/favorites_routines", methods=["GET"])
@jwt_required()
def get_favorites_routines():
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "user":
        return jsonify({"msg": "Solo los usuarios pueden ver sus rutinas favoritas"}), 403

    favorites_routines = Favorites_Routines.query.filter_by(
        user_id=current_user.id
    ).all()

    return jsonify([favorite.serialize() for favorite in favorites_routines]), 200


@api.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify({"user": user.serialize()}), 200


@api.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    body = request.get_json()

    if not body:
        return jsonify({"msg": "Body vacío"}), 400

    if "name" in body:
        user.name = body.get("name")

    if "fitness_goals" in body:
        user.fitness_goals = body.get("fitness_goals")

    if "fitness_level" in body:
        user.fitness_level = body.get("fitness_level")

    if "birth_date" in body:
        user.birth_date = body.get("birth_date")

    if "phone" in body:
        user.phone = body.get("phone")

    if "avatar_url" in body:
        user.avatar_url = body.get("avatar_url")

    db.session.commit()

    return jsonify({
        "msg": "Perfil actualizado",
        "user": user.serialize()
    }), 200


@api.route("/favorites_classes", methods=["GET"])
@jwt_required()
def get_favorites_classes():
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "user":
        return jsonify({"msg": "Solo los usuarios pueden ver sus clases favoritas"}), 403

    favorites_classes = Favorites_Classes.query.filter_by(
        user_id=current_user.id).all()

    return jsonify([favorite.serialize() for favorite in favorites_classes]), 200


@api.route("/favorites_classes/<int:class_id>", methods=["POST"])
@jwt_required()
def add_favotites_classes(class_id):
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "user":
        return jsonify({"msg": "Solo los usuarios pueden agregar clases a favoritos"}), 403

    classes = GymClass.query.get(class_id)

    if not classes:
        return jsonify({"msg": "Clase no encontrada"}), 404

    if Favorites_Classes.query.filter_by(user_id=current_user.id, class_id=class_id).first():
        return jsonify({"msg": "Clase ya agregada a favoritos"}), 400

    new_class = Favorites_Classes(
        user_id=current_user.id,
        class_id=class_id
    )

    try:
        db.session.add(new_class)
        db.session.commit()
        return jsonify({
            "msg": "Clase agregada a favoritos exitosamente",
            "routine": new_class.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "msg": "Error al agregar clase a favoritos",
            "error": str(e)
        }), 500


@api.route("/favorites_classes/<int:class_id>", methods=["DELETE"])
@jwt_required()
def delete_classes(class_id):
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "user":
        return jsonify({"msg": "Solo los usuarios pueden eliminar clases"}), 403

    favorite = Favorites_Classes.query.filter_by(
        user_id=current_user.id,
        class_id=class_id
    ).first()

    if not favorite:
        return jsonify({"msg": "No tienes esta clase agregada a favoritos"}), 404

    try:
        db.session.delete(favorite)
        db.session.commit()
        return jsonify({"msg": "Clase eliminada exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "msg": "Error al eliminar la clase",
            "error": str(e)
        }), 500


@api.route("/assigned_routines", methods=["GET"])
@jwt_required()
def get_assigned_routines():
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    assigned_routines = Assigned_Routines.query.filter_by(
        user_id=current_user.id).all()

    return jsonify([assigned.serialize() for assigned in assigned_routines]), 200


@api.route("/assigned_routines/<int:user_id>/<int:routine_id>", methods=["POST"])
@jwt_required()
def assign_routine(user_id, routine_id):
    current_user = get_current_user()

    if not current_user or current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden asignar rutinas"}), 403

    user = User.query.get(user_id)
    routine = Routine.query.get(routine_id)

    if not user or not routine:
        return jsonify({"msg": "Usuario o rutina no encontrada"}), 404

    if Assigned_Routines.query.filter_by(user_id=user_id, routine_id=routine_id).first():
        return jsonify({"msg": "Rutina ya asignada a este usuario"}), 400

    from datetime import datetime
    assigned_date = datetime.now().strftime("%Y-%m-%d")

    new_assigned = Assigned_Routines(
        user_id=user_id,
        routine_id=routine_id,
        assigned_by=current_user.id,
        assigned_date=assigned_date
    )

    try:
        db.session.add(new_assigned)
        db.session.commit()
        return jsonify({
            "msg": "Rutina asignada exitosamente",
            "assigned": new_assigned.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al asignar rutina"}), 500


@api.route("/assigned_routines/<int:user_id>/<int:routine_id>", methods=["DELETE"])
@jwt_required()
def unassign_routine(user_id, routine_id):
    current_user = get_current_user()

    if not current_user or current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden desasignar rutinas"}), 403

    assigned = Assigned_Routines.query.filter_by(
        user_id=user_id,
        routine_id=routine_id,
        assigned_by=current_user.id
    ).first()

    if not assigned:
        return jsonify({"msg": "Asignación no encontrada"}), 404

    try:
        db.session.delete(assigned)
        db.session.commit()
        return jsonify({"msg": "Rutina desasignada exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al desasignar rutina"}), 500


@api.route("/assigned_classes", methods=["GET"])
@jwt_required()
def get_assigned_classes():
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    assigned_classes = Assigned_Classes.query.filter_by(
        user_id=current_user.id).all()

    return jsonify([assigned.serialize() for assigned in assigned_classes]), 200


@api.route("/assigned_classes/<int:user_id>/<int:class_id>", methods=["POST"])
@jwt_required()
def assign_class(user_id, class_id):
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role == "user" and current_user.id != user_id:
        return jsonify({"msg": "No autorizado"}), 403

    if current_user.role not in ["trainer", "user"]:
        return jsonify({"msg": "No autorizado"}), 403

    user = User.query.get(user_id)
    gym_class = GymClass.query.get(class_id)

    if not user or not gym_class:
        return jsonify({"msg": "Usuario o clase no encontrada"}), 404

    existing_assignment = Assigned_Classes.query.filter_by(
        user_id=user_id,
        class_id=class_id
    ).first()

    if existing_assignment:
        if current_user.role == "user":
            return jsonify({"msg": "Ya estás registrado en esta clase"}), 400
        return jsonify({"msg": "Clase ya asignada a este usuario"}), 400

    occupied_slots = Assigned_Classes.query.filter_by(
        class_id=class_id).count()

    if occupied_slots >= gym_class.capacity:
        return jsonify({"msg": "No hay cupos disponibles para esta clase"}), 400

    from datetime import datetime
    assigned_date = datetime.now().strftime("%Y-%m-%d")

    new_assigned = Assigned_Classes(
        user_id=user_id,
        class_id=class_id,
        assigned_by=current_user.id,
        assigned_date=assigned_date
    )

    try:
        db.session.add(new_assigned)
        db.session.commit()
        return jsonify({
            "msg": "Registro exitoso a la clase" if current_user.role == "user" else "Clase asignada exitosamente",
            "assigned": new_assigned.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "msg": "Error al registrar la clase",
            "error": str(e)
        }), 500


@api.route("/assigned_classes/<int:user_id>/<int:class_id>", methods=["DELETE"])
@jwt_required()
def unassign_class(user_id, class_id):
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role == "user" and current_user.id != user_id:
        return jsonify({"msg": "No autorizado"}), 403

    if current_user.role not in ["trainer", "user"]:
        return jsonify({"msg": "No autorizado"}), 403

    assigned = Assigned_Classes.query.filter_by(
        user_id=user_id,
        class_id=class_id
    ).first()

    if not assigned:
        return jsonify({"msg": "Asignación no encontrada"}), 404

    try:
        db.session.delete(assigned)
        db.session.commit()
        return jsonify({"msg": "Clase desasignada exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al desasignar clase"}), 500


@api.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    current_user = get_current_user()

    if not current_user or current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden ver la lista de usuarios"}), 403

    users = User.query.filter_by(role="user").all()
    return jsonify([user.serialize() for user in users]), 200


# ==========================================
# RUTAS PARA EJERCICIOS (CRUD)
# ==========================================

@api.route("/exercises", methods=["GET"])
def get_exercises():
    exercises = Exercise.query.all()
    return jsonify([exercise.serialize() for exercise in exercises]), 200


@api.route("/exercises/<int:exercise_id>", methods=["GET"])
def get_exercise(exercise_id):
    exercise = Exercise.query.get(exercise_id)

    if not exercise:
        return jsonify({"msg": "Ejercicio no encontrado"}), 404

    return jsonify(exercise.serialize()), 200


@api.route("/exercises", methods=["POST"])
@jwt_required()
def create_exercise():
    current_user = get_current_user()

    if not current_user or current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden crear ejercicios"}), 403

    body = request.get_json()
    if not body:
        return jsonify({"msg": "Body vacío"}), 400

    required_fields = ["name", "zone", "equipment", "execution", "preparation"]
    for field in required_fields:
        if not body.get(field):
            return jsonify({"msg": f"El campo '{field}' es requerido"}), 400

    new_exercise = Exercise(
        name=body.get("name"),
        zone=body.get("zone"),
        equipment=body.get("equipment"),
        execution=body.get("execution"),
        preparation=body.get("preparation"),
        image_url=body.get("image_url")
    )

    try:
        db.session.add(new_exercise)
        db.session.commit()
        return jsonify({
            "msg": "Ejercicio creado exitosamente",
            "exercise": new_exercise.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al crear el ejercicio", "error": str(e)}), 500


@api.route("/exercises/<int:exercise_id>", methods=["PUT"])
@jwt_required()
def update_exercise(exercise_id):
    current_user = get_current_user()

    if not current_user or current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden modificar ejercicios"}), 403

    exercise = Exercise.query.get(exercise_id)
    if not exercise:
        return jsonify({"msg": "Ejercicio no encontrado"}), 404

    body = request.get_json()
    if not body:
        return jsonify({"msg": "Body vacío"}), 400

    if "name" in body:
        exercise.name = body.get("name")
    if "zone" in body:
        exercise.zone = body.get("zone")
    if "equipment" in body:
        exercise.equipment = body.get("equipment")
    if "execution" in body:
        exercise.execution = body.get("execution")
    if "preparation" in body:
        exercise.preparation = body.get("preparation")
    if "image_url" in body:
        exercise.image_url = body.get("image_url")

    try:
        db.session.commit()
        return jsonify({
            "msg": "Ejercicio actualizado exitosamente",
            "exercise": exercise.serialize()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar el ejercicio", "error": str(e)}), 500


@api.route("/exercises/<int:exercise_id>", methods=["DELETE"])
@jwt_required()
def delete_exercise(exercise_id):
    current_user = get_current_user()

    if not current_user or current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden eliminar ejercicios"}), 403

    exercise = Exercise.query.get(exercise_id)
    if not exercise:
        return jsonify({"msg": "Ejercicio no encontrado"}), 404

    try:
        db.session.delete(exercise)
        db.session.commit()
        return jsonify({"msg": "Ejercicio eliminado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar el ejercicio", "error": str(e)}), 500

from flask import request, jsonify, Blueprint
from api.models import db, User, GymClass, Routine
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)
CORS(api)

def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200


@api.route('/signup', methods=['POST'])
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


@api.route('/login', methods=['POST'])
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


@api.route('/private', methods=['GET'])
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


@api.route('/classes', methods=['POST'])
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

    required_fields = ["title", "description", "category", "date", "time", "duration", "capacity", "level"]
    for field in required_fields:
        if not body.get(field):
            return jsonify({"msg": f"El campo '{field}' es requerido"}), 400

    new_class = GymClass(
        title=body.get("title"),
        description=body.get("description"),
        category=body.get("category"),
        date=body.get("date"),
        time=body.get("time"),
        duration=int(body.get("duration")),
        capacity=int(body.get("capacity")),
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


@api.route('/classes', methods=['GET'])
def get_classes():
    classes = GymClass.query.all()
    return jsonify([gym_class.serialize() for gym_class in classes]), 200


@api.route('/routines', methods=['POST'])
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

    required_fields = ["name", "description", "goal", "level", "estimated_time", "exercises"]
    for field in required_fields:
        if not body.get(field):
            return jsonify({"msg": f"El campo '{field}' es requerido"}), 400

    new_routine = Routine(
        name=body.get("name"),
        description=body.get("description"),
        goal=body.get("goal"),
        level=body.get("level"),
        estimated_time=int(body.get("estimated_time")),
        exercises=body.get("exercises"),
        trainer_id=current_user.id
    )

    db.session.add(new_routine)
    db.session.commit()

    return jsonify({
        "msg": "Rutina creada exitosamente",
        "routine": new_routine.serialize()
    }), 201


@api.route('/routines', methods=['GET'])
def get_routines():
    routines = Routine.query.all()
    return jsonify([routine.serialize() for routine in routines]), 200


@api.route('/my-classes', methods=['GET'])
@jwt_required()
def my_classes():
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden ver sus clases"}), 403

    classes = GymClass.query.filter_by(trainer_id=current_user.id).all()
    return jsonify([gym_class.serialize() for gym_class in classes]), 200


@api.route('/my-routines', methods=['GET'])
@jwt_required()
def my_routines():
    current_user = get_current_user()

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if current_user.role != "trainer":
        return jsonify({"msg": "Solo los entrenadores pueden ver sus rutinas"}), 403

    routines = Routine.query.filter_by(trainer_id=current_user.id).all()
    return jsonify([routine.serialize() for routine in routines]), 200
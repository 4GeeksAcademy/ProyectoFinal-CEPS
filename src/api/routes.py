from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


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

    if not email or not password:
        return jsonify({"msg": "Email y password son requeridos"}), 400

    if len(password) < 6:
        return jsonify({"msg": "La contraseña debe tener al menos 6 caracteres"}), 400

    existing_user = User.get_by_email(email)
    if existing_user:
        return jsonify({"msg": "El usuario ya existe"}), 409

    new_user = User(
        email=email,
        is_active=True
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
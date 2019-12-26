import os
from flask import request, jsonify

from app.models import User
from app.models import Role
from . import auth

user = User()
role = Role()

@auth.route("/login", methods=["POST"])
def login():
    status = 200
    err = None,
    result = None

    request_form = request.get_json()
    
    try:
        login_user = user.validate_user(request_form['username'], request_form['password'])
        result = user.encode_auth_token(login_user).decode()
    except Exception as e:
        status = 400
        err = str(e)

    return jsonify({
        "msg": err,
        "result": result
    }), status


@auth.route("/register", methods=["POST"])
def register():
    # get request body
    request_form = request.get_json()

    # check if username exist
    user_exist = user.find_one({"username": request_form["username"]}) is not None

    if user_exist:
        return jsonify({
            "msg": "Username duplicated.",
            "result": None
        }), 400

    # Find user role
    user_role = role.find_one({
        "name": "user"
    })

    try:
        createdId = user.create({
            "username": request_form["username"],
            "password": request_form["password"],
            "roleId": str(user_role["_id"]),
        }).inserted_id

        access_token = user.encode_auth_token({'_id': createdId, 
                                               'roleId': user_role['_id']
                                              })

        return jsonify({
            "msg": "Successfully registered.",
            "result": access_token.decode()
        }), 201

    except Exception as e:
        print(e)
        return jsonify({
            "msg": str(e),
            "result": None
        }), 400
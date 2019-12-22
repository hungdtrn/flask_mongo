import os
from flask import request, jsonify

from . import api
from ..models.user import User
from ..models.role import Role

user = User()
role = Role()

@api.route("/users", methods=["GET"])
def find_users():
    result = user.find()
    
    return jsonify({
        'err': None,
        'result': result
    }), 200


@api.route("/users/<ObjectId:id>", methods=["GET"])
def find_user_by_id(id):
    result = user.find_one({"_id": id})
    
    return jsonify({
        'err': None,
        'result': result
    }), 200


@api.route("/login", methods=["POST"])
def login():
    status = 200
    err = None,
    result = None

    try:
        result = user.validate_user(request.form['username'], request.form['password'])
    except Exception as e:
        status = 400
        err = str(e)

    return jsonify({
        "err": err,
        "result": result
    }), status


@api.route("/register", methods=["POST"])
def register():
    # Find user role
    user_role = role.find_one({
        "name": "user"
    })

    try:
        rs = user.create({
            "username": request.form["username"],
            "password": request.form["password"],
            "roleId": str(user_role["_id"]),
        })

        return jsonify({
            "err": None,
            "result": rs
        }), 201

    except Exception as e:
        return jsonify({
            "err": str(e),
            "result": None
        }), 400



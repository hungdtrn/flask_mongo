import datetime

from flask import current_app as app
import bcrypt
import jwt
from bson import ObjectId

from .basemodel import BaseModel

def remove_sensitive_property(user):
    if user is None:
        return

    del user['hash']
    del user['salt']
    
def filter_admin(user):
    pass

class User(BaseModel):
    dbadapter = None

    def __init__(self):
        super(User, self).__init__()
        assert User.dbadapter is not None, "Database adapter is not intialized"

    @property
    def schema(self):
        return {
            "type": "object",
            "properties": {
                "username": {
                    "type": "string"
                },
                "email": {
                    "type": "string"
                },
                "firstname": {
                    "type": "string"
                },
                "lastname": {
                    "type": "string"  
                },
                "roleId": {
                    "type": "string"
                },
                "salt": {
                    "type": "string"
                },
                "hash": {
                    "type": "string"
                }
            },
            "required": ["username", "email", "firstname", "lastname", "salt", "hash", "roleId"],
            "additionalProperties": False
        }

    @property
    def adapter(self):
        return User.dbadapter

    @staticmethod
    def init_db(adapter):
        User.dbadapter = adapter

    @staticmethod
    def ensure_unique_properties():
        # Ensure unique properties
        try:
            User.dbadapter.create_index("username", unique=True)
        except Exception as e:
            print("Warning in ensuring unique user properties: ", str(e))


    def find(self, query=None):
        users = super().find(query)
        for u in users:
            remove_sensitive_property(u)
        
        return users

    def find_one(self, query):
        user = super().find_one(query)
        remove_sensitive_property(user)

        return user
    
    def validate_user(self, username, password):
        user = super().find_one({'username': username})

        if user is None:
            raise Exception("Username not found")

        if not bcrypt.checkpw(password.encode(), user['hash'].encode()):
            raise Exception("Password is incorrect")
        
        remove_sensitive_property(user)

        return user

    def create(self, data):
        """
        Create new user record
        :param data|object
        :return: userId|ObjectId
        """

        salt = bcrypt.gensalt()
        hash_ = bcrypt.hashpw(data['password'].encode(), salt)

        user = {
            'username': data['username'],
            "firstname": data['firstname'],
            'lastname': data['lastname'],
            'email': data['email'],
            'roleId': ObjectId(data['roleId']),
            'hash': hash_.decode(),
            'salt': salt.decode()
        }

        return super(User, self).create(user)

    def encode_auth_token(self, user):
        """Generate auth token
        :param user|dict
        :param exp|number
        :param secret|string
        :return: token|string
        """

        try:
            payload  = {
                "exp": datetime.datetime.now() + datetime.timedelta(seconds=app.config["TOKEN_EXP"]),
                "iat": datetime.datetime.utcnow(),
                "_id": str(user["_id"]),
                "role": str(user["role"])
            }

            return jwt.encode(
                payload,
                app.config["SECRET_KEY"],
                algorithm="HS256"
            )
        except Exception as e:
            raise e

    def decode_auth_token(self, token):
        """
        Decodes the auth token
        """
        try:
            payload = jwt.decode(token, app.config["SECRET_KEY"])
            return payload
        except jwt.ExpiredSignature as e:
            raise e
        except jwt.InvalidTokenError as e:
            raise e
        except Exception as e:
            raise e
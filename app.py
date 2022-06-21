import os.path
import sqlite3

from flask import Flask, redirect, render_template, request, session, url_for
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "db.sqlite")

conn = sqlite3.connect(db_path, check_same_thread=False)

cursor_setup = conn.cursor()
cursor_setup.execute('CREATE TABLE IF NOT EXISTS users(username text, email text, password text)')
conn.commit()
cursor_setup.close()

@app.route('/')
def welcome():
    return render_template("welcome.html")

@app.route('/login', methods=['GET', 'POST'])
def login():

    if request.method == 'POST' and 'username' in request.form and 'password' in request.form:
        session.permanent = True

        username = request.form['username']
        password = request.form['password']

        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))

        user = cursor.fetchone()
        print(user)

        if user and check_password_hash(user[2], password):
            session['loggedin'] = True
            session['username'] = user[0]

            return redirect(url_for('index.html'))
        else:
            msg = 'Incorrect username/password'
    
    return render_template("login.html")

@app.route('/register')
def register():
    return render_template("register.html")

@app.route('/home')
def home():
    return render_template("index.html")

@app.route('/myaccount')
def myaccount():
    return render_template("myaccount.html")

if __name__ == "__main__":
    app.run()
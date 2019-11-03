from flask import Flask, request, jsonify, render_template
from fastai.basic_train import load_learner
from fastai.vision import open_image
from flask_cors import CORS,cross_origin
from fastai.tabular import load_learner, add_datepart
import pandas as pd
import numpy as np
import pdb
import os
import csv
import json
from flask import url_for
from flask import send_from_directory


app = Flask(__name__, static_url_path='/static/')
CORS(app, support_credentials=True)

app.config['ENV'] = 'development'
app.config['DEBUG'] = True
app.config['TESTING'] = True


@app.route('/')
def home():
  return render_template('index.html')


infer = load_learner('./models/', file='date_prev_btc_model.pkl')


# route for prediction
@app.route('/predict/', methods = ['GET'])
def predict():
  date = request.args.get('date')
  prev = request.args.get('prev')
  prev = float(prev)
  print ("prevtype",type(prev), "datetype", type(date))
  result = {"prediction" : pred_single(date, prev)}
  return jsonify(result)

def pred_single(date, prev, learn=infer):
  print(f'Getting predictions for date {date} with prev closing price of {prev}')
  
  df = pd.DataFrame(dict(Date=date, prev=prev), index=[0])
  add_datepart(df, 'Date')
  pred = learn.predict(df.iloc[0])
  print(pred)
  res = round(np.exp(pred[0].data.item()), 2)
  print(res)
  return res

if __name__ == '__main__':
  app.run()

#@cross_origin(origin='localhost',headers=['Content-Type','Authorization'])


@app.route('/static/<path:path>')
def send_js(path):
    return send_from_directory('static', path)




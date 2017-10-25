__author__ = 'Wessel Klijnsma'
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("../pos_agg_w2017.csv")


df = df[df.date != 'date'].sort_values(by='date')
df['date'] = pd.to_datetime(df['date'])
df = df[df['date'] >= '2015-02-24']
df['date'] = df['date'].dt.strftime('%Y-%m-%d')
print(df)
print(df.to_json('positions.json', orient='records'))

# data_agg = pd.DataFrame.from_csv('data_agg_w2017.csv')
# fcf = pd.DataFrame.from_csv('forecast_final_fastcount.csv')
# fcs = pd.DataFrame.from_csv('forecast_final_slowcount.csv')
# data_agg = data_agg.join(fcf).join(fcs)
# data_agg = data_agg.loc['2015-02-24':]
# data_agg.to_csv('data_agg_all.csv')
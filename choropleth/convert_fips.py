import pandas as pd
import json

tsv = pd.read_csv("./data/county_fips.tsv", sep='\t')
tsv = tsv[["FIPS", "Name"]]
print(tsv.head())
county_json = json.loads(tsv.to_json())
print(county_json)

with open('county_fips.json', 'w') as outfile:  
    json.dump(county_json, outfile)
import pandas as pd
import json

def write_county_json():
    tsv = pd.read_csv("../data/county_fips.tsv", sep='\t')
    tsv = tsv[["FIPS", "Name"]]
    print(tsv.head())
    county_json = json.loads(tsv.to_json())
    print(county_json)

    with open('county_fips.json', 'w') as outfile:  
        json.dump(county_json, outfile)

def write_od_distribution_json():
    csv = pd.read_csv("../data/county_health_rankings.csv")
    csv = csv[["FIPS", "Drug Overdose Mortality Rate"]]
    max_od = csv["Drug Overdose Mortality Rate"].max()
    print(max_od)

    csv["pctile"] = (csv["Drug Overdose Mortality Rate"] / max_od * 100)
    csv["pctile"] = pd.to_numeric(csv["pctile"], downcast="unsigned")   
    print(csv.tail())

if __name__ == "__main__":
    write_od_distribution_json()
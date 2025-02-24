import json
import requests
import yaml
import os
import sys

def fetch_clinical_trial_data(nct_id, fields=None):
    base_url = "https://clinicaltrials.gov/api/v2"
    endpoint = f"/studies/{nct_id}"
    if fields:
        endpoint += f"?fields={','.join(fields)}"
    url = f"{base_url}{endpoint}"

    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            print(f"Failed to fetch data. Status code: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error occurred: {e}")
        return None

def load_config(config_file):
    with open(config_file, 'r') as f:
        return json.load(f)

def extract_fields(input_data, config):
    extracted_data = {}
    fields = config.get("fields", {})
    fields_sub = config.get("sub_fields", {})
    for field, path in fields.items():
        value = input_data
        try:
            keys = path.split('.')
            for i, key in enumerate(keys):
                if key == '*':
                    sub_keys = keys[i+1:]
                    if sub_keys:  # Ensure there are sub-keys to extract
                        extracted_data[field] = []
                        for sub_value in value:
                            if isinstance(sub_value, dict):
                                sub_extracted_data = extract_fields(sub_value, {"fields": {field: ".".join(sub_keys)}})
                                extracted_data[field].append(sub_extracted_data)
                    break
                elif "[" in key and "]" in key:
                    key, index = key.split("[")
                    if index.strip("]") == '*':
                        extracted_data[field] = []
                        for sub_index, sub_value in enumerate(value[key]):
                            if isinstance(sub_value, dict):
                                sub_extracted_data = {}
                                for sub_key in keys[i+1:]:
                                    if sub_key.startswith('[') and sub_key.endswith(']'):
                                        sub_field= sub_key.strip('[]').split(',')
                                        for value in sub_field:
                                            try:
                                                sub_field_value = sub_value.get(value)
                                                key_sub = fields_sub.get(value)
                                                sub_extracted_data[key_sub] = sub_field_value if sub_field_value is not None else ""
                                            except KeyError:
                                                sub_extracted_data[fields_sub.get(value)] = "Null"
                                    else:
                                        sub_value = sub_value[sub_key]
                                extracted_data[field].append(sub_extracted_data)
                    else:
                        index = index.strip("]")
                        if ',' in index:  # Handle multiple fields within square brackets
                            sub_fields = index.split(',')
                            sub_extracted_data = {}
                            for sub_field in sub_fields:
                                sub_field = sub_field.strip()
                                sub_value = value[key]
                                if isinstance(sub_value, list):
                                    sub_extracted_data[sub_field] = [entry.get(sub_field) for entry in sub_value if isinstance(entry, dict)]
                                elif isinstance(sub_value, dict):
                                    sub_extracted_data[sub_field] = sub_value.get(sub_field)
                            extracted_data[field] = sub_extracted_data
                        else:
                            if index.isdigit():
                                value = value[key][int(index)]
                            else:
                                value = value[key]
                else:
                    value = value[key]
            else:
                extracted_data[field] = value
        except (KeyError, TypeError):
            pass
    return extracted_data

def add_nested_fields(extracted_data, config):
    add_nested = config.get("add_nested", {})
    for nested_field, nested_path in add_nested.items():
        if nested_field in extracted_data:
            nested_value = extracted_data.pop(nested_field)
            nested_keys = nested_path.split('.')
            current = extracted_data
            for nested_key in nested_keys[:-1]:
                if (nested_key not in current) and nested_key == nested_field:
                    current[nested_key] = {}
                elif nested_key not in current:
                    current[nested_key] = [{}]
                elif not isinstance(current[nested_key], (list, dict)):
                    current[nested_key] = [{}]
                if isinstance(current[nested_key], list):
                    if not current[nested_key]:
                        current[nested_key].append({})
                    current = current[nested_key][0]
                else:
                    current = current[nested_key]
            final_key = nested_keys[-1]
            current[final_key] = nested_value
    return extracted_data

def transform_nested_fields(data, template,completeData):
    #print(data, template)
    key = template.split('[')[1].strip(']')
    key2 = template.split('[')[2].strip(']')
    key3 = template.split('[')[3].strip(']')
    if isinstance(data, list):
        transformed_list = []
        for item in data:
            transformed_item = {}
            transformed_item[key] = item.split(': ')[-1]
            transformed_item[key2] = completeData[key3]
            transformed_list.append(transformed_item)
            #print(completeData[key3])
        return transformed_list
    elif isinstance(data, dict):
        for k, v in data.items():
            data[k] = transform_nested_fields(v, template, completeData)
    return data

def transform_fields(extracted_data, config):
    add_objects = config.get("add_objects", {})
    for field, template in add_objects.items():
        if field in extracted_data:
            #print(extracted_data)
            extracted_data[field] = transform_nested_fields(extracted_data[field], template, extracted_data)
        else:
            for key, value in extracted_data.items():
                if isinstance(value, dict):
                    extracted_data[key] = transform_fields(value, config)
                elif isinstance(value, list):
                    for i in range(len(value)):
                        if isinstance(value[i], dict):
                            value[i] = transform_fields(value[i], config)
    return extracted_data

def process_data(original_data, config_file, output_dir, nct_id):
    config = load_config(config_file)
    extracted_data = extract_fields(original_data, config)
    extracted_data = add_nested_fields(extracted_data, config)
    extracted_data = transform_fields(extracted_data, config)
    # Output files based on NCT ID
    output_file_json = os.path.join(output_dir, f"{nct_id}.json")
    output_file_yaml = os.path.join(output_dir, f"{nct_id}.yaml")
    with open(output_file_json, 'w') as f:
        json.dump(extracted_data, f, indent=4)
    with open(output_file_yaml, 'w') as f:
        yaml.dump(extracted_data, f, indent=4, sort_keys=False)

def main():
    if len(sys.argv) != 4:
        print("Usage: python script.py <nct_id> <config_file> <output_dir>")
        sys.exit(1)
    
    nct_id = sys.argv[1]
    config_file = sys.argv[2]
    output_dir = sys.argv[3]

    fields_to_fetch = [
        "BriefTitle", "OfficialTitle", "ContactsLocationsModule", "DesignModule", "DescriptionModule","ProtocolSection",
        "BriefSummary",
        "OverallStatus", "LeadSponsor",
        "ArmsInterventionsModule",
        "StatusModule",
        "EligibilityModule",
        "ContactsLocationsModule",
        "SponsorCollaboratorsModule"
    ]

    clinical_trial_data = fetch_clinical_trial_data(nct_id, fields_to_fetch)
    if clinical_trial_data:
        process_data(clinical_trial_data, config_file, output_dir, nct_id)
        print(f"Data fetched, processed, and saved as {nct_id}.json and {nct_id}.yaml in {output_dir}")

if __name__ == "__main__":
    main()

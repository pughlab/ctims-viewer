import sys
import pandas as pd
import matplotlib.pyplot as plt

def generate_bar_chart(data, output_image_path):
    # Group by 'TrialArmId' and count unique 'patient_id's
    counts = data.groupby('TrialArmId')['patient_id'].nunique()

    # Create bar chart with vertical bars
    plt.figure(figsize=(10, 8))
    plt.bar(counts.index, counts.values, color='steelblue')

    # Update layout
    plt.title('Count of Patients Matched to an ARM')
    plt.xlabel('ARM Name')
    plt.ylabel('Count of Unique Patients')
    plt.xticks(rotation=90)  # Rotate x-axis labels for better readability
    plt.yticks(fontsize=6)

    # Save the plot as an image
    plt.savefig(output_image_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Bar chart image saved as:", output_image_path)

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage: python script_name.py path_to_csv_file output_image_path 'TrialArmId1,TrialArmId2,...'")
        sys.exit(1)
    
    csv_file_path = sys.argv[1]
    output_image_path = sys.argv[2]
    trial_arm_ids_str = sys.argv[3]
    trial_arm_ids = trial_arm_ids_str.split(',')

    print("TrialArmIds:", trial_arm_ids)

    # Load data
    data = pd.read_csv(csv_file_path)

    print("Number of rows in original data:", len(data))  # Print number of rows in original data

    # Convert 'TrialArmId' to string
    data['TrialArmId'] = data['TrialArmId'].astype(str)

    # Filter data for specific TrialArmId values
    data_filtered = data[data['TrialArmId'].isin(trial_arm_ids)]

    # Remove duplicate rows
    data_unique = data_filtered.drop_duplicates(subset=['TrialArmId', 'patient_id'])

    print("Number of rows after filtering and removing duplicates:", len(data_unique))  # Print number of rows after filtering and removing duplicates

    # Generate bar chart
    generate_bar_chart(data_unique, output_image_path)

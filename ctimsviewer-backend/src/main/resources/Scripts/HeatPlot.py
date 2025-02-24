import sys
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def generate_heatmap(data, output_image_path, fixed_height=16):
    # Pivot the unique data to create a matrix of matches between patient IDs and internal IDs
    heatmap_data = data.groupby(['TrialArmId', 'patient_id']).size().unstack(fill_value=0)
    
    # Calculate the count of matches for each internal ID
    match_count = heatmap_data.sum(axis=1)
    print("Count of matches for each internal ID:\n", match_count)

    # Sort data based on internal IDs and patients
    sorted_indices = (match_count / match_count.sum()).sort_values(ascending=False).index
    heatmap_data_sorted_internal = heatmap_data.loc[sorted_indices]
    sorted_patients = heatmap_data_sorted_internal.sum(axis=0).sort_values(ascending=False).index
    heatmap_data_sorted_combined = heatmap_data_sorted_internal[sorted_patients]

    # Set figure size with fixed height and dynamic width based on number of ARM names
    num_arms = len(heatmap_data_sorted_combined.index)
    fig_height_per_arm = fixed_height / num_arms
    plt.figure(figsize=(16, fixed_height))  # Fixed height of 16

    ax = sns.heatmap(heatmap_data_sorted_combined, cmap='Greys', cbar=False)

    # Update layout
    ax.set_title('Patient IDs by Trial Arms', fontsize=16)
    ax.set_xlabel('Patient ID', fontsize=12)
    ax.set_ylabel('ARM Name', fontsize=12)
    ax.set_xticks([])
    ax.set_yticklabels(ax.get_yticklabels(), fontsize=6)  # Adjust font size of y-axis tick labels

    # Adjust layout and margins
    plt.subplots_adjust(left=0.3, right=0.95, top=0.9, bottom=0.2)

    # Save the plot as an image file
    plt.savefig(output_image_path, dpi=300)
    plt.close()
    print("Heatmap image saved as:", output_image_path)

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

    # Convert 'TrialArmId' to string type
    data['TrialArmId'] = data['TrialArmId'].astype(str)

    # Filter data for specific TrialArmId values
    data_filtered = data[data['TrialArmId'].isin(trial_arm_ids)]

    # Remove duplicate rows to keep only unique data
    data_unique = data_filtered.drop_duplicates(subset=['TrialArmId', 'patient_id'])

    print("Number of rows after filtering and removing duplicates:", len(data_unique))  # Print number of rows after filtering and removing duplicates

    # Generate heatmap
    generate_heatmap(data_unique, output_image_path)

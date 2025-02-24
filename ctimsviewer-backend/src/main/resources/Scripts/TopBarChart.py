import pandas as pd
import plotly.graph_objects as go
import sys

def generate_bar_chart(data, output_image_path):
    # Count matches for each patient ID
    counts = data['patient_id'].value_counts()

    # Sort counts in descending order
    sorted_counts = counts.sort_values(ascending=False).reset_index(drop=True)

    # Create bar chart
    fig = go.Figure(go.Bar(x=sorted_counts.index, y=sorted_counts.values, marker=dict(color='rgb(45, 94, 127)')))

    # Update layout
    fig.update_layout(
        title='Count of Matches for Each Patient ID',
        xaxis=dict(title='Patient ID', categoryorder='category ascending', visible=False),
        yaxis=dict(title='Trials matched per patient '),
        bargap=0,
        bargroupgap=0
    )

    # Save the plot as an image
    fig.write_image(output_image_path)
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

    # Convert 'TrialArmId' to string type
    data['TrialArmId'] = data['TrialArmId'].astype(str)

    # Filter data for specific TrialArmId values
    data_filtered = data[data['TrialArmId'].isin(trial_arm_ids)]

    # Remove duplicate rows to keep only unique data
    data_unique = data_filtered.drop_duplicates(subset=['TrialArmId', 'patient_id'])

    print("Number of rows after filtering and removing duplicates:", len(data_unique))  # Print number of rows after filtering and removing duplicates

    # Generate bar chart
    generate_bar_chart(data_unique, output_image_path)

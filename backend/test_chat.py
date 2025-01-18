import requests

def main():
    print("Emergency Assistant Chat (type 'quit' to exit)")
    print("--------------------------------------------")

    while True:
        user_input = input("\nYou: ")
        if user_input.lower() == 'quit':
            break

        # Send request to Flask endpoint
        response = requests.post(
            'http://localhost:5000/api/app',
            json={'message': user_input},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print(f"\nAssistant: {response.json()['response']}")
        else:
            print(f"\nError: {response.json().get('error', 'Unknown error occurred')}")

if __name__ == "__main__":
    main()

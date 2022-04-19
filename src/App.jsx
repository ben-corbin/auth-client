import './App.css';
import { useState } from 'react';
import Form from './components/Form';
import Input from './components/Input';

export default function App() {
    const [user, setUser] = useState({ username: '', password: '' });
    const [registerResponse, setRegisterResponse] = useState('');
    const [loginResponse, setLoginResponse] = useState('');

    const register = async (e) => {
      e.preventDefault();

      //We want to make a HTTP request to our server!
      //This is the information we want to send:
      //
      //url     : http://localhost:4000/register
      //method  : POST
      //body    : { username: '', password: ''}
      //headers : content-type: application/json
      //
      //We can do that with fetch - but fetch makes
      //a GET request by default, so we use the 
      //options object to set up the request.
      const options = {
        //Send a post request
        method: 'POST',
        //Set the headers
        headers: {
          'content-type' :'application/json'
        },
        //Set the body of the request - we want to send
        //our data in JSON format, so we use JSON.stringify
        body: JSON.stringify({
          username: user.username,
          password: user.password
        })
      }

      fetch("http://localhost:4000/register", options)
        .then(res => res.json())
        .then(json => setRegisterResponse('Registered user:' + json.data.username))
        .catch(() => {
          //If the server is unavailable, then show an error
          //to the user
          setRegisterResponse('Server error')
        })
    };

    const login = async (e) => {
      e.preventDefault();

      const options = {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          username: user.username,
          password: user.password
        })
      }

      fetch("http://localhost:4000/login", options)
        .then(res => res.json())
        .then(json => {
          setLoginResponse('Logged In, got token:' + json.data)
          
          //Stores the token in local storage under the key 
          //'jwt'. In a more realistic app, we could check
          //on application load if there is a token present - 
          //if there is, we could skip the login page using 
          //something like React Router.
          localStorage.setItem('jwt', json.data)

          //Once a user is logged in, load their todos
          loadTodosForUser()
        })
    };

    const loadTodosForUser = () => {
      //Here we are making a GET request to an authenticated 
      //endpoint - so we need to pass in the login token! We provide
      //it as a Authorization header.
      const options = {
        headers : {
          'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        }
      }

      fetch('http://localhost:4000/todos', options)
        .then(res =>{
          //Rather than the usual format, we do the res.json() callback
          //*inside* this function - this makes it easier for us to 
          //check the status code back from the server and handle cases
          //where we've got back an error response
          res.json().then(json=>{

            //See: https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
            //If the response was "OK" (a 20X code), then convert to JSON
            if(res.ok) {
              //Handle the JSON response here
              console.log("Todos:", json)
            } else {
              //The request failed with a non-20X response code - either
              //show the user an error or go back to the login page, depending
              //on the status code (res.status). In this simple case, we
              //just log a message
              console.log("Invalid response code:", res.status)
              console.log("Invalid response data:", json)
            }
          })
        }).catch(e=> {
          //Catch will be called whenever we are unable to contact the 
          //server at all. Here we just log out the error, but again in
          //a real application you'd try to provide some feedback to the
          //user.
          console.log("Unable to contact server:", e)
        })
    }

    // You can safely ignore everything below this line, it's just boilerplate
    // so you can focus on the exercise requirements

    const handleChange = (e) => {
        const { value, name } = e.target;

        setUser({
            ...user,
            [name]: value
        });
    }

    return (
        <div className="App">

            <h1>Register</h1>

            <Form
                handleSubmit={register}
                inputs={[
                    <Input
                        key={1}
                        type='text'
                        name='username'
                        placeholder='Username'
                        value={user.username}
                        handleChange={handleChange}
                    />,
                    <Input
                        key={2}
                        type='password'
                        name='password'
                        placeholder='Password'
                        value={user.password}
                        handleChange={handleChange}
                    />
                ]}
            />

            {registerResponse && <p>{registerResponse}</p>}

            <h1>Login</h1>

            <Form
                handleSubmit={login}
                inputs={[
                    <Input
                        key={1}
                        type='text'
                        name='username'
                        placeholder='Username'
                        value={user.username}
                        handleChange={handleChange}
                    />,
                    <Input
                        key={2}
                        type='password'
                        name='password'
                        placeholder='Password'
                        value={user.password}
                        handleChange={handleChange}
                    />
                ]}
            />

            {loginResponse && <p>{loginResponse}</p>}

        </div>
    );
}

import React, { useState } from "react";
import { useAppState } from "../AppStateContext";
import axios from "axios";
import "./login.css";

function Login() {
    const { setLoggedIn } = useAppState();
    const [loginStage, setLoginStage] = useState(0);
    const [input, setInput] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        contact: "",
        dob: "",
        monthlyIncome: "",
        gender: "",
    });
    const [messages, setMessages] = useState([]);

    const handleInputChange = async (event) => {
        setMessages([]);
        const { name, value } = event.target;
        setInput((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        if (name === "email") {
            if (validateEmail(value)) {
                try {
                    await checkifunique();
                } catch (error) {
                    console.error("Error checking uniqueness:", error);
                }
            } else {
                setMessages(["Invalid Email"]);
            }
        }
        if (name === "contact") {
            if (value.length === 10) {
                try {
                    await checkifunique();
                } catch (error) {
                    console.error("Error checking uniqueness:", error);
                }
            } else {
                setMessages(["Invalid Contact"]);
            }
        }
    };

    async function checkifunique() {
        try {
            const loginData = {
                contact: input.contact,
                email: input.email,
            };
            const response = await axios.post("http://localhost:8000/check/", loginData);
            if (response.data && response.data.status) {
                setMessages([response.data.message || ""]);
                return response.data.unique || true;
            } else {
                setMessages([response.data.message || "Server error"]);
            }
        } catch (error) {
            setMessages(["Server Error"]);
            return false;
        }
    }

    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    const addMessage = (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    const validateInputs = async () => {
        let isValid = true;
        setMessages([]);

        switch (loginStage) {
            case 1:
                const isUnique = await checkifunique(); // Check if the email and contact are unique
                if (!isUnique || !validateEmail(input.email) || input.contact.length !== 10) {
                    isValid = false;
                    addMessage("Invalid Email or contact");
                }
                if (!input.email) {
                    addMessage("Email cannot be empty");
                    isValid = false;
                }
                if (!input.contact) {
                    addMessage("Contact cannot be empty");
                    isValid = false;
                }
                if (!input.dob) {
                    addMessage("Date of birth cannot be empty");
                    isValid = false;
                }
                if (!input.gender) {
                    addMessage("Gender cannot be empty");
                    isValid = false;
                }
                break;
            case 2:
                if (!input.monthlyIncome) {
                    addMessage("Monthly income is required");
                    isValid = false;
                }
                break;
            case 3:
                if (!input.username) {
                    addMessage("Username cannot be empty");
                    isValid = false;
                }

                if (!input.password) {
                    addMessage("Password cannot be empty");
                    isValid = false;
                }

                if (!input.confirmPassword) {
                    addMessage("Confirm Password cannot be empty");
                    isValid = false;
                }

                if (input.password !== input.confirmPassword) {
                    addMessage("Passwords do not match");
                    isValid = false;
                }
                break;
        }

        return isValid;
    };

    const handleNextStageChange = async () => {
        setMessages([]);
        const isValid = await validateInputs();
        if (isValid) {
            setLoginStage((prevStage) => prevStage + 1);
        }
    };

    const handlePrevStageChange = () => {
        setMessages([]);
        setLoginStage((prevStage) => prevStage - 1);
    };

    const handleCreateAccount = async () => {
        if (validateInputs()) {
            try {
                const response = await axios.post("http://localhost:8000/signup/", input);
                if (response.data.status && response.data) {
                    setMessages(["Account created successfully"]);
                } else {
                    setMessages([response.data.message || "Server error"]);
                }
            } catch (error) {
                setMessages(["Account creation failed"]);
            }
        }
    };

    const handleLogin = async () => {
        let isValid = true;
        setMessages([]);

        // if (input.username === "test" && input.password === "test") {
        //     setLoggedIn(true);
        // }

        if (!input.username) {
            addMessage("Username cannot be empty");
            isValid = false;
        }

        if (!input.password) {
            addMessage("Password cannot be empty");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        try {
            const loginData = {
                username: input.username,
                password: input.password,
            };
            const response = await axios.post("http://localhost:8000/login", loginData);
            if (response.data && response.data.status) {
                console.log(response.data);
                console.log(response.data.token);
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('username', loginData.username);
                console.log(sessionStorage.getItem('token'));
                addTokenInterceptor(sessionStorage.getItem('token'));
                setLoggedIn(true);
            } else {
                setMessages([response.data.message || "Server error"]);
            }
        } catch (error) {
            setMessages(["Login failed"]);
        }
    };

    const addTokenInterceptor = (token) => {
        axios.interceptors.request.use(
          (config) => {
            if (token) {
              config.headers['Authorization'] = `${token}`;
            }
            return config;
          },
          (error) => {
            return Promise.reject(error);
          }
        );
      };

    const renderLoginStage = () => {
        switch (loginStage) {
            case 0:
                return (
                    <div className="login">
                        <h1>Welcome {input.username}</h1>
                        <input
                            type="text"
                            className="input"
                            name="username"
                            value={input.username}
                            onChange={handleInputChange}
                            placeholder="Username"
                        />
                        <input
                            type="password"
                            className="input"
                            name="password"
                            value={input.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                        />
                        <button type="button" className="button" onClick={handleLogin}>
                            LOG IN
                        </button>
                        <button type="button" className="button" onClick={handleNextStageChange}>
                            SIGN UP
                        </button>
                        {messages.map((message, index) => (
                            <p key={index}>{message}</p>
                        ))}
                    </div>
                );
            case 1:
                return (
                    <div className="login">
                        <h1>SIGN UP</h1>
                        <input
                            type="email"
                            className="input"
                            name="email"
                            value={input.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                        />
                        <input
                            type="tel"
                            className="input"
                            name="contact"
                            value={input.contact}
                            onChange={handleInputChange}
                            placeholder="Contact"
                        />
                        <input
                            type="date"
                            className="input"
                            name="dob"
                            value={input.dob}
                            onChange={handleInputChange}
                            placeholder="Date of birth"
                            max={new Date().toISOString().split("T")[0]}
                        />
                        <select
                            className="input"
                            name="gender"
                            value={input.gender}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <button type="button" className="button" onClick={handleNextStageChange}>
                            NEXT {">"}
                        </button>
                        <button type="button" className="button" onClick={() => setLoginStage(0)}>
                            CANCEL
                        </button>
                        {messages.map((message, index) => (
                            <p key={index}>{message}</p>
                        ))}
                    </div>
                );
            case 2:
                return (
                    <div className="login">
                        <h1>2 / 3</h1>
                        <p style={{ color: "turquoise" }}>
                            Income is used for personalization purposes,{" "}
                        </p>
                        <input
                            type="number"
                            className="input"
                            name="monthlyIncome"
                            value={input.monthlyIncome}
                            onChange={handleInputChange}
                            placeholder="Monthly income"
                        />
                        <button type="button" className="button" onClick={handleNextStageChange}>
                            NEXT {">"}
                        </button>
                        <button type="button" className="button" onClick={handlePrevStageChange}>
                            {"<"} PREV
                        </button>
                        <button type="button" className="button" onClick={() => setLoginStage(0)}>
                            CANCEL
                        </button>
                        {messages.map((message, index) => (
                            <p key={index}>{message}</p>
                        ))}
                    </div>
                );
            case 3:
                return (
                    <div className="login">
                        <h1>3 / 3</h1>
                        <input
                            type="text"
                            className="input"
                            name="username"
                            value={input.username}
                            onChange={handleInputChange}
                            placeholder="Username"
                        />
                        <input
                            type="password"
                            className="input"
                            name="password"
                            value={input.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                        />
                        <input
                            type="password"
                            className="input"
                            name="confirmPassword"
                            value={input.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm password"
                        />
                        <button type="button" className="button" onClick={handleCreateAccount}>
                            CREATE ACCOUNT
                        </button>
                        <button type="button" className="button" onClick={handlePrevStageChange}>
                            {"<"} PREV
                        </button>
                        <button type="button" className="button" onClick={() => setLoginStage(0)}>
                            CANCEL
                        </button>
                        {messages.map((message, index) => (
                            <p key={index}>{message}</p>
                        ))}
                    </div>
                );
            case 4:
                return (
                    <div className="login">
                        <h1>WELCOME</h1>
                        <button type="button" className="button" onClick={() => setLoginStage(0)}>
                            BACK TO LOGIN
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <img src={require("../logo.png")} alt="Logo" className="loginlogo" />
            <img
                src={require("../bg1.jpeg")}
                alt="Logo"
                style={{
                    width: "100vw",
                    height: "100vh",
                    objectFit: "cover",
                    overflow: "hidden",
                    filter: "brightness(0.3)",
                }}
            />
            <div className="login-container">{renderLoginStage()}</div>
        </>
    );
}

export default Login;

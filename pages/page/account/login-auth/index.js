import axios from 'axios';
import Head from 'next/head';
import Cookies from 'js-cookie';
import PhoneInput from 'react-phone-input-2';
import React, { useContext, useEffect, useRef, useState } from "react";

import { AppContext } from "../../../_app";

import ToastMessage from "../../../../components/Notification/ToastMessage";
import { checkPasswordStrength, googleLogin, loginManual, register } from "../../../../AxiosCalls/UserServices/userServices";
import googleLogo from '../../../../public/assets/images/Loginimages/googleLogo.png';

import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import 'react-phone-input-2/lib/style.css';

const Login = () => {

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const timerRef = useRef(null);
  const { setTriggers, userStatus,baseUserId } = useContext(AppContext);

  const loginUsernameRef = useRef(null);
  const loginPassWordRef = useRef(null);
  const registerUserName = useRef(null);
  const registerEmailID = useRef(null);
  const registerPassword = useRef(null);
  const forgotPassVerifyEmail = useRef(null);
  const forgotPassVerifyRef = useRef(null);
  const forgotPassPass = useRef(null);
  const forgotPassConfirmPass = useRef(null);

  const [counter, setCounter] = useState(60);
  const [currenctState, setCurrenctState] = useState('login');

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [showPasswordForgotPass, setShowPasswordForgotPass] = useState(false);
  const [showPasswordForgotConfirmPass, setShowPasswordForgotConfirmPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpVerifyStatus, setOtpVerifyStatus] = useState(false);
  const [otpSendingLoading, setOtpSendingLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loadingForgottPass, setLoadingForgottPass] = useState(false);
  const [forgotResetProcess, setForgotResetProcess] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);

  const [errors, setErrors] = useState([]);

  const [forgotEmail, setForgotEmail] = useState('');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));

  const [userRegisterLoginDetails, setUserRegisterLoginDetails] = useState({
    userName: '',
    email: '',
    passWord: ''
  });

  const [verifyOTPforgot, setVerifyOTPforgot] = useState({
    verificationCode: '',
    passWord: '',
    confirmPassword: ''
  });

  const [forgotEmailStatus, setForgotEmailStatus] = useState({
    status: false,
    message: '',
    statusCode: ''
  });
  // manual login

  const validateForm = () => {

    if (email === '') {
      loginUsernameRef.current.style.borderColor = 'red';
    } else {
      loginUsernameRef.current.style.borderColor = '#49a764';
    }

    if (password === '') {
      loginPassWordRef.current.style.borderColor = 'red';
    } else {
      loginPassWordRef.current.style.borderColor = '#49a764';
    }

    if (email === '' && password === '') {
      setError("Email addresss and password is required");
      return false;
    } else if (email === '') {
      setError("Email addresss is required");
      return false;
    } else if (password === '') {
      setError("Password is required");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;

  };
 const [loadingLogin, setLoadingLogin] = useState(false);
  const handleSubmit = async (e) => {
    setLoadingLogin(true);
    e.preventDefault();

    setLoginLoading(true);
    setError("");

    if (!validateForm()) {
      setLoginLoading(false);
    } else {
      try {
        const registerUser = {
          userName: email,
          passWord: password
        }
        const result = await loginManual(registerUser);
         if (result.status === 200 && result.data.status === 200) {
          handleNavigate(result.data.id, result.data.hashed_key);
          ToastMessage({ status: 'success', message: ` Welcome back  ${registerUser.userName} ` });
          setLoginLoading(false);
          setLoadingLogin(false);
          return;
        } else if (result.status === 200 || result.data.status === 422 && (result.data.status === 401 )) {
          ToastMessage({ status: "warning", message: result.data.error_message || "Login failed. Please check your credentials and try again." })
        } else if ( result.status === 200 && result.data.status === 400) {
          ToastMessage({ status: "error", message: "The username must be a valid email address." })
        } else if ( result.status === 200 && result.data.status === 404) {
          ToastMessage({ status: "error", message: "Login failed. Please check your credentials and try again." })
        } else if ( result.status === 200 && result.data.status == 500) {
          ToastMessage({ status: 'error', message: 'Login failed. Please check your credentials and try again.' })
        }
      } catch (error) {
        ToastMessage({ status: "error", message: "Login failed. Please check your credentials and try again." })
      }
    }

    setLoginLoading(false);
    setLoadingLogin(false);
  };

  // google login
  const handleGoogleHandle = async () => {
    // setLoginLoading(true);
    const result = await googleLogin();
    if (result?.status === 200 && result?.data?.status === 401) {
      // setLoginLoading(false)
      ToastMessage({ status: "error", message: "Your Account Has Been Permanently Deactivated." });
    } else if (result?.data?.status === 200 && result?.data?.usercount > 0) {
      // setLoginLoading(false);
      ToastMessage({ status: 'success', message: `Login successfull` });
      handleNavigate(result.data.id, result.data.hashed_key);
    }
    // setLoginLoading(false);
  }

  // register
 const validateRegisterForm = () => {

  let result = true;

  let newErrors = [];

  if (userRegisterLoginDetails.userName === '') {
    newErrors.push('Username');
    registerUserName.current.style.borderColor = 'red';
    result = false;
  } else if (userRegisterLoginDetails.userName.startsWith(' ')) {
    // Check if username starts with a space
    newErrors.push('Username cannot start with a space');
    registerUserName.current.style.borderColor = 'red';
    result = false;
  } else if (!/^[a-zA-Z0-9][a-zA-Z0-9 ]*$/.test(userRegisterLoginDetails.userName)) {
    // Allow letters, numbers, and spaces (but not starting with space)
    // The regex: ^[a-zA-Z0-9] - must start with letter or number
    // [a-zA-Z0-9 ]* - can contain letters, numbers, and spaces afterwards
    newErrors.push('Username can only contain letters, numbers, and spaces (cannot start with space)');
    registerUserName.current.style.borderColor = 'red';
    result = false;
  } else {
    registerUserName.current.style.borderColor = '#49a764';
  }

  if (userRegisterLoginDetails.email === '') {
    newErrors.push('Email');
    registerEmailID.current.style.borderColor = 'red';
    result = false;
  } else if (!emailRegex.test(userRegisterLoginDetails.email)) {
    newErrors.push('Invalid email format');
    registerEmailID.current.style.borderColor = 'red';
    result = false;
  } else {
    registerEmailID.current.style.borderColor = '#49a764';
  }

  if (userRegisterLoginDetails.passWord === '') {
    newErrors.push('Password');
    registerPassword.current.style.borderColor = 'red';
    result = false;
  } else if (passwordStrength < 3) {
    newErrors.push('Please add strong password');
    registerPassword.current.style.borderColor = 'red';
    result = false;
  } else {
    registerPassword.current.style.borderColor = '#49a764';
  }

  setErrors(newErrors);
  return result;

};

  const submitRegisterForm = async (e) => {

    e.preventDefault();
    setRegisterLoading(true);

    if (validateRegisterForm()) {
      try {
        await register(userRegisterLoginDetails).then((result) => {
          if (result.data.status === 200) {
            console.log(result.data,"result.dataregister")
            setErrors(['Registration successfull.']);
            resetLoginForm();
            setCurrenctState('login');
            handleNewUserSendNotification(result.data?.newcx?.customer_id);
          } else {
            setErrors(['Registration failed. Please try again.']);
          }
        })
      } catch (error) {
        setErrors(['An error occurred. Please try again later.'])
      }
    }

    setRegisterLoading(false);

  };

  const handleNewUserSendNotification = async (id)=>{
        const randomId = Math.random().toString(36).substring(2, 15);

    const dataD = {
          user_id: id,
          token_id: randomId,
          token_status: "LoggedIn",
        };
 
        console.log("Data set tokens are get tokennnnn", dataD);
 
        axios
          .post("save_fcm_tokens", dataD, {
            xsrfHeaderName: "X-XSRF-TOKEN",
            withCredentials: true,
          })
          .then((res) => {
            if (res.data.status === 200) {
              console.log("FCM Token Saveddddd", res.data);
            } else {
            }
          })
          .catch((resda) => {
            console.log("FCM Token Saveddddd", resda);
          });
  }

  const GeneratePasswordStrengthContainer = () => {
    return (
      (userRegisterLoginDetails.passWord.length > 1 && passwordStrength === 0) ?
        <span style={{ color: "red", fontSize: 12 }}>( Very bad )</span>
        : (userRegisterLoginDetails.passWord.length > 1 && (passwordStrength === 1 || passwordStrength === 2)) ?
          <span style={{ color: "orange", fontSize: 12 }}>( Good )</span>
          : (userRegisterLoginDetails.passWord.length > 1 && passwordStrength >= 3) ?
            <span style={{ color: "green", fontSize: 12 }}>( Excellent )</span>
            : null
    )
  };

  // forgot password

  const handleValidateMail = (value) => {
    return emailRegex.test(value)
  }

  const handleSumitForgotPassword = async (e) => {

    e.preventDefault();

    setLoadingForgottPass(true);

    const formData = {
      userEmail: forgotEmail
    }

    if (!handleValidateMail(forgotEmail)) {
      setForgotEmailStatus({
        status: true,
        message: 'Please verify the mail address',
        statusCode: '500'
      });
      forgotPassVerifyEmail.current.style.borderColor = 'red';
    } else {
      forgotPassVerifyEmail.current.style.borderColor = '#49a764';
      await axios.post('forgot-password-mobile', formData, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true
      }).then((response) => {
        if (response.status === 200 && response.data.status === 404) {
          setForgotEmailStatus({
            status: true,
            message: response.data.message,
            statusCode: '404'
          });
          forgotPassVerifyEmail.current.style.borderColor = 'red';
        } else if (response.status === 200 && response.data.status === 200) {
          setForgotEmailStatus({
            status: true,
            message: 'Password Reset OTP Sent Successfully.',
            statusCode: '200'
          });
        }
      }).catch((error) => {
        // console.error(error)
      });
    }

    setLoadingForgottPass(false);

  }

  const handleSubmitVerification = (e) => {

    e.preventDefault();

    setForgotResetProcess(true);

    const formData = {
      token: verifyOTPforgot.verificationCode,
      userPassword: verifyOTPforgot.passWord,
      userConfirmPassword: verifyOTPforgot.confirmPassword
    }

    axios.post('userreset', formData, {
      xsrfHeaderName: "X-XSRF-TOKEN",
      withCredentials: true
    }).then((response) => {
      if (response.status === 200 && response.data.status === 200) {
        resetLoginForm();
        setCurrenctState('login');
        ToastMessage({ status: 'success', message: 'Password reset successfully, kindly login with updated username and password' })
      } else if (response.status === 200 && response.data.status === 400) {
        setForgotEmailStatus({
          status: true,
          message: 'Verification OTP is not matching.',
          statusCode: '500'
        });
      } else if (response.status === 200 && response.data.status === 401) {
        setForgotEmailStatus({
          status: true,
          message: 'The user confirm password and user password must match.',
          statusCode: '500'
        });
      } else {
        ToastMessage({ status: 'success', message: 'Something went wrong !' });
      }
    }).catch((error) => {
      // console.error(error)
    });

    setForgotResetProcess(false);

  }

  const handleNavigate = (id, hashedVal) => {

    if (userStatus.userLoggesIn) {
      window.location.assign("/");
      localStorage.setItem("#__uid", id);
      Cookies.set('hashedVal', hashedVal, { secure: true, sameSite: 'strict' });
  
      setTimeout(() => {
        setTriggers((prevTriggers) => ({
          ...prevTriggers,
          customerCartTrigger: !prevTriggers.customerCartTrigger,
          baseCurrencyTrigger: !prevTriggers.baseCurrencyTrigger,
          userLoginTrigger: !prevTriggers.userLoginTrigger,
          userDesireLocation: !prevTriggers.userDesireLocation,
        }));
      }, 10000);
       return
    } else {
      const dataBack = localStorage.getItem("lastPath");
      window.location.assign(dataBack || "/");
      localStorage.removeItem("lastPath");
    }

    localStorage.setItem("#__uid", id);
    Cookies.set('hashedVal', hashedVal, { secure: true, sameSite: 'strict' });

    setTimeout(() => {
      setTriggers((prevTriggers) => ({
        ...prevTriggers,
        customerCartTrigger: !prevTriggers.customerCartTrigger,
        baseCurrencyTrigger: !prevTriggers.baseCurrencyTrigger,
        userLoginTrigger: !prevTriggers.userLoginTrigger,
        userDesireLocation: !prevTriggers.userDesireLocation,
      }));
    }, 10000);

  };

  const startCounter = () => {
    timerRef.current = setInterval(() => {
      setCounter((prevCounter) => {
        if (prevCounter > 0) {
          return prevCounter - 1;
        } else {
          return prevCounter;
        }
      });
    }, 1000);
  };

  const [otpSendOption, setOtpSendOption] = useState('sendVerification');

  const handlePhoneNumberSubmit = async (e) => {
    // console.log("handlePhoneNumberSubmit called with phoneNumber:", phoneNumber);
    // if(!phoneNumber) {

    // }
    e.preventDefault();
    setOtpSendingLoading(true);
    setIsOtpSent(false);
    try {
      await axios.post(`/${otpSendOption}`, {
        mobile_number: `+${phoneNumber}`,
      }).then((response) => {
        // console.log("otp", response)
        setIsOtpSent(true);
        setCounter(60);
        startCounter();
        ToastMessage({ status: "success", message: "OTP sent successfully!" });
      });
    } catch (error) {
      console.log("Error sending OTP:", error?.response?.data?.message);
      ToastMessage({ status: "error", message: error?.response?.data?.message });
    }
    setOtpSendingLoading(false);
  };

  const handleResendOtp = (e) => {
    if (counter === 0) {
      setOtpSendOption('resendVerification');
      handlePhoneNumberSubmit(e);
    }
  }

  const handleOtpChange = (element, index) => {
    if (/^\d*$/.test(element.value)) {
      let newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);
      if (element.nextSibling && element.value) {
        element.nextSibling.focus();
      }
    }
  };

  const handleOtpSubmit = async (e) => {

    e.preventDefault();
    setOtpVerifyStatus(true);

    const enteredOtp = otp.join("");

    const data = {
      mobile_number: `+${phoneNumber}`,
      otp: enteredOtp,
    };

    const mobileNum = {
      mobileNum: phoneNumber,
    };

    console.log(data,"OTP verified successfully! 123")

    try {
      await axios.post("verifyPhoneNumber", data, { xsrfHeaderName: "X-XSRF-TOKEN", withCredentials: true }).then(async (response) => {
        console.log("OTP verified successfully!", response);
        if (response.data.status === 200) {
          console.log("OTP verified successfully!", response);

          handleNavigate(response.data.id, response.data.hashed_key);
          ToastMessage({ status: "success", message: "Login success." });
        } else {
          ToastMessage({ status: "error", message: response.data.message || "Login failed !" });
        }
      })
    } catch (err) {
      console.log("Error verifying OTP:", err);
      ToastMessage({ status: "error", message: "Something went wrong !." });
    }
    setOtpVerifyStatus(false);

  };

  useEffect(() => {
    setError("");
    setErrors([]);
  }, [currenctState]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

const resetRegistrationForm = () => {
  setUserRegisterLoginDetails({
    userName: '',
    email: '',
    passWord: ''
  });
  setPasswordStrength(0);
  setErrors([]);
  
  // Reset border colors of registration form inputs
  if (registerUserName.current) {
    registerUserName.current.style.borderColor = '';
  }
  if (registerEmailID.current) {
    registerEmailID.current.style.borderColor = '';
  }
  if (registerPassword.current) {
    registerPassword.current.style.borderColor = '';
  }
};

const resetLoginForm = () => {
  setEmail('');
  setPassword('');
  setError('');
  
  // Reset border colors of login form inputs
  if (loginUsernameRef.current) {
    loginUsernameRef.current.style.borderColor = '';
  }
  if (loginPassWordRef.current) {
    loginPassWordRef.current.style.borderColor = '';
  }
};

const resetForgotPasswordForm = () => {
  setForgotEmail('');
  setVerifyOTPforgot({
    verificationCode: '',
    passWord: '',
    confirmPassword: ''
  });
  setForgotEmailStatus({
    status: false,
    message: '',
    statusCode: ''
  });
  
  // Reset border colors
  if (forgotPassVerifyEmail.current) {
    forgotPassVerifyEmail.current.style.borderColor = '';
  }
  if (forgotPassVerifyRef.current) {
    forgotPassVerifyRef.current.style.borderColor = '';
  }
  if (forgotPassPass.current) {
    forgotPassPass.current.style.borderColor = '';
  }
  if (forgotPassConfirmPass.current) {
    forgotPassConfirmPass.current.style.borderColor = '';
  }
};

const resetMobileLoginForm = () => {
  setPhoneNumber('');
  setOtp(new Array(6).fill(""));
  setIsOtpSent(false);
  setOtpVerifyStatus(false);
  setCounter(60);
  if (timerRef.current) {
    clearInterval(timerRef.current);
  }
};

  return (
    <>
      <Head>
        <title>Aahaas - Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <section className='d-flex align-items-center flex-wrap m-0 p-0'>
        {/* Logo for larger screens */}
        <div className='col-12 d-flex align-items-center justify-content-center d-none d-lg-block banner-logo-container' 
             style={{ marginBottom: '-8%', marginLeft: '-12.5%', zIndex: '20' }}>
          <img src={`/assets/images/iconsAndLogos/aahaas_monoMain.png`} 
               className='d-none' 
               alt="logo" 
               style={{ backgroundColor: 'white', width: '100px', height: 'auto', marginBottom: '-40px', borderRadius: '50%', padding: '10px 10px' }} />
        </div>

        {/* Banner image container - will be hidden on iPad Pro */}
        <div className='border p-0 d-none d-lg-block banner-image-container'>
          <img src={`/assets/images/Banners/banner2.png`} alt="logo" className="banner-image" style={{ width: '100%', height: '100vh' }} />
          <img src={`/assets/images/iconsAndLogos/Slogan.png`} className="slogan-image" alt="logo" />
          <img src={`/assets/images/iconsAndLogos/waveSymbol.png`} className="waveSymbol-image" alt="logo" />
        </div>

        {/* Login form container */}
        <div className='col m-0 p-0 mx-4 mx-sm-5 d-flex flex-column align-items-center login-container'>
          {/* Main logo */}
          <img src={`/assets/images/iconsAndLogos/mainLogo.png`} 
               className="mx-auto mb-0 mt-5 mt-sm-0 main-logo" 
               alt="logo" 
               style={{ width: '220px', height: 'auto' }} />

          {/* Login form */}
          <form className="col-12 col-lg-8 px-0 px-sm-4 pt-5 pb-3 rounded-2" 
                style={{ display: currenctState === 'login' ? 'block' : 'none' }} 
                onSubmit={handleSubmit}>

            <div className='d-flex flex-column align-items-start mb-4'>
              <h3 className='m-0 p-0 fs-2'>Welcome back !</h3>
              <div className='d-flex align-items-center mt-1'>
                <p className='m-0 p-0'>wander in, journey on: your passport to adventure awaits !</p>
              </div>
            </div>

            <div className='login-form'>

              <div className='input-container'>
                <label htmlFor="email">Email <span className='required-asterik'>*</span> </label>
                <input type="email" ref={loginUsernameRef} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className='input-container-password'>
                <label htmlFor="password">Password <span className='required-asterik'>*</span> </label>
                <div>
                  <input type={showPassword ? "text" : "password"} ref={loginPassWordRef} id="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{}} />
                  <IconButton className='passwordVisible-btn' onClick={() => setShowPassword(!showPassword)} >{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                </div>
              </div>

              <div className='input-container flex-row'>
                <p className="text-danger">{error}</p>
                <span className='ms-auto text-primary text-capitalize' style={{ cursor: 'pointer' }} onClick={() => {
                  resetForgotPasswordForm();
                  setCurrenctState('forgotPass');
                }}>forgot password ?</span>
              </div>
              <div className='input-container'>
                <button type="submit" onClick={handleSubmit} style={{ fontSize: 10 }} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3" disabled={loginLoading}>{loginLoading ? 'Checking your credentials' : 'Login'}</button>
              </div>

              <div className='border my-3'></div>

              <div className='d-flex align-items-center justify-content-center flex-wrap col-gap-5 login-options-container'>
                <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={handleGoogleHandle}>
                  <img src={googleLogo.src} className='mb-1' style={{ width: '20px', height: '20px' }} />
                  <span className="p-0 m-0 px-2">Login with Google</span>
                </div>
                <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => {
                  resetMobileLoginForm();
                  setCurrenctState('mobileLogin');
                }}>
                  <i className="fa fa-phone" style={{ fontSize: "19px" }}></i>
                  <span className="p-0 m-0 px-2">Login with Mobile Number</span>
                </div>
                 <div className='col-8 d-flex align-items-center pt-3 justify-content-center'>
                  <span onClick={() => {window.location.href = "https://dev.aahaas.com/";}} style={{ cursor: 'pointer' }} className='mx-2 text-primary text-capitalize'>Explore as visitor</span>
                </div>
                <div className='col-8 d-flex align-items-center pt-3 justify-content-center'>
                {/* <div className='col-8 d-flex align-items-center border-top pt-3 justify-content-center'> */}
                  <p className='m-0 p-0'>don't have account ?</p>
                  <span onClick={() => {
                    resetRegistrationForm()
                    setCurrenctState('register')}} style={{ cursor: 'pointer' }} className='mx-2 text-primary text-capitalize'>Sign Up</span>
                </div>
              </div>

            </div>

          </form>

          {/* Register form */}
          <form className="col-12 col-lg-8 px-0 px-sm-4 pt-5 pb-3 rounded-2" 
                style={{ display: currenctState === 'register' ? 'block' : 'none' }} 
                onSubmit={submitRegisterForm}>

            <div className='d-flex flex-column align-items-start mb-4'>
              <h3 className='m-0 p-0 fs-2'>Enlist for exploration</h3>
              <div className='d-flex align-items-center mt-1'>
                <p className='m-0 p-0'>embark on a world of adventures adventure now and make every journey yours!</p>
              </div>
            </div>

            <div className='login-form'>

              <div className='input-container'>
                <label htmlFor="email">Username <span className='required-asterik'>*</span> </label>
                <input type="name" ref={registerUserName} placeholder="Eg : Jone123" name="userName" value={userRegisterLoginDetails.userName} onChange={(e) => setUserRegisterLoginDetails({ ...userRegisterLoginDetails, userName: e.target.value })} required />
              </div>

              <div className='input-container'>
                <label htmlFor="email">Email <span className='required-asterik'>*</span> </label>
                <input type="email" ref={registerEmailID} placeholder="Eg : Johndoe@gmail.com" name="email" value={userRegisterLoginDetails.email} onChange={(e) => setUserRegisterLoginDetails({ ...userRegisterLoginDetails, email: e.target.value })} required />
              </div>

              <div className='input-container-password'>
                <label htmlFor="email">Password {GeneratePasswordStrengthContainer()}<span className='required-asterik'>*</span> </label>
                <div>
                  <input type={showPasswordRegister ? 'text' : 'password'} ref={registerPassword} placeholder="Eg : JohnDoe@987" name="password" value={userRegisterLoginDetails.passWord}
                    onChange={(e) => {
                      const password = e.target.value
                      setUserRegisterLoginDetails({ ...userRegisterLoginDetails, passWord: password })
                      setPasswordStrength(checkPasswordStrength(password))
                    }}
                    required />
                  <IconButton className='passwordVisible-btn' onClick={() => setShowPasswordRegister(!showPasswordRegister)} >{showPasswordRegister ? <VisibilityOff /> : <Visibility />}</IconButton>
                </div>
              </div>

              <div className='input-container flex-row'>
                <span className={`${errors.length === 0 ? 'd-none' : 'd-block'}`}  >{errors?.join(' & ').concat(' is required.')}</span>
                <span className='ms-auto' style={{ cursor: 'pointer' }} onClick={() => {
                  resetLoginForm();
                  setCurrenctState('login');
                }}>already have an account - <span className='text-primary text-capitalize'> sign in ? </span></span>
              </div>

              <div className='input-container'>
                <button type="submit" onClick={submitRegisterForm} style={{ fontSize: 10 }} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3" disabled={registerLoading}>{registerLoading ? 'Loading...' : 'Create Account'}</button>
              </div>

              <div className='border my-3'></div>

              <div className='d-flex align-items-center justify-content-center flex-wrap col-gap-5 login-options-container'>
                <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={handleGoogleHandle}>
                  <img src={googleLogo.src} className='mb-1' style={{ width: '20px', height: '20px' }} />
                  <span className="p-0 m-0 px-2">Login with Google</span>
                </div>
                <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => {
                  resetMobileLoginForm();
                  setCurrenctState('mobileLogin');
                }}>
                  <i className="fa fa-phone" style={{ fontSize: "19px" }}></i>
                  <span className="p-0 m-0 px-2">Login with Mobile Number</span>
                </div>
                <div className='col-12 d-flex align-items-center border-top pt-3 justify-content-center'>
                  <span className='mx-auto text-primary text-capitalize' style={{ cursor: 'pointer' }} onClick={() => {
                    resetForgotPasswordForm();
                    setCurrenctState('forgotPass');
                  }}>forgot password ?</span>
                </div>
              </div>

            </div>

          </form>

          {/* Forgot password form */}
          <form className="col-12 col-lg-8 px-0 px-sm-4 pt-5 pb-3 rounded-2" 
                style={{ display: currenctState === 'forgotPass' ? 'block' : 'none' }} 
                onSubmit={forgotEmailStatus.status ? handleSumitForgotPassword : handleSubmitVerification}>

            <div className='d-flex flex-column align-items-start mb-4'>
              <h3 className='m-0 p-0 fs-2'>Forgot password</h3>
              <div className='d-flex align-items-center mt-1'>
                <p className='m-0 p-0'>Provide your Aahaas user email to get password reset.</p>
              </div>
            </div>

            <div className='login-form'>

              {
                !forgotEmailStatus.status &&
                <div className='input-container'>
                  <label htmlFor="email">Email <span className='required-asterik'>*</span> </label>
                  <input type="email" placeholder="Email" value={forgotEmail} ref={forgotPassVerifyEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                </div>
              }

              {
                forgotEmailStatus.status &&
                <div className='input-container'>
                  <label htmlFor="text">OTP code <span className='required-asterik'>*</span> </label>
                  <input type="text" placeholder="Please Enter the Verification Code." ref={forgotPassVerifyRef} value={verifyOTPforgot.verificationCode} name='verificationCode' id='verificationCode' onChange={(e) => setVerifyOTPforgot({ ...verifyOTPforgot, verificationCode: e.target.value })} required />
                </div>
              }

              {
                forgotEmailStatus.status &&
                <div className='input-container-password'>
                  <label htmlFor="password">Password <span className='required-asterik'>*</span> </label>
                  <div>
                    <input type={showPasswordForgotPass ? "text" : "password"} placeholder="Password." value={verifyOTPforgot.passWord} ref={forgotPassPass} name='passWord' id='passWord' onChange={(e) => setVerifyOTPforgot({ ...verifyOTPforgot, passWord: e.target.value })} required />
                    <IconButton className='passwordVisible-btn' onClick={() => setShowPasswordForgotPass(!showPasswordForgotPass)} >{showPasswordForgotPass ? <VisibilityOff /> : <Visibility />}</IconButton>
                  </div>
                </div>
              }

              {
                forgotEmailStatus.status &&
                <div className='input-container-password'>
                  <label htmlFor="confirm password">Confirm password <span className='required-asterik'>*</span> </label>
                  <div>
                    <input type={showPasswordForgotConfirmPass ? "text" : "password"} placeholder="Confirm Password." ref={forgotPassConfirmPass} value={verifyOTPforgot.confirmPassword} name='confirmPassword' id='confirmPassword' onChange={(e) => setVerifyOTPforgot({ ...verifyOTPforgot, confirmPassword: e.target.value })} required />
                    <IconButton className='passwordVisible-btn' onClick={() => setShowPasswordForgotConfirmPass(!showPasswordForgotConfirmPass)} >{showPasswordForgotConfirmPass ? <VisibilityOff /> : <Visibility />}</IconButton>
                  </div>
                </div>
              }

              <div className='input-container flex-row'>
                <p className={forgotEmailStatus.statusCode === "200" ? "text-success" : "text-danger"}>{forgotEmailStatus.message}</p>
                <span className='ms-auto text-primary text-capitalize' style={{ cursor: 'pointer' }} onClick={() => {
                  resetRegistrationForm();
                  setCurrenctState('register')}}>create new account ?</span>
              </div>

              <div className='input-container'>
                {
                  forgotEmailStatus.status ?
                    <button type="submit" onClick={handleSubmitVerification} style={{ fontSize: 10 }} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3" disabled={forgotResetProcess}>{forgotResetProcess ? 'Verifying' : 'Reset Password'}</button>
                    : <button type="submit" onClick={handleSumitForgotPassword} style={{ fontSize: 10 }} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3" disabled={loadingForgottPass}>{loadingForgottPass ? 'Sending OTP' : 'Send OTP'}</button>
                }
              </div>

              <div className='border my-3'></div>

              <div className='d-flex align-items-center justify-content-center flex-wrap col-gap-5 login-options-container'>
                <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={handleGoogleHandle}>
                  <img src={googleLogo.src} className='mb-1' style={{ width: '20px', height: '20px' }} />
                  <span className="p-0 m-0 px-2">Login with Google</span>
                </div>
                <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => {
                  resetMobileLoginForm();
                  setCurrenctState('mobileLogin');
                }}>
                  <i className="fa fa-phone" style={{ fontSize: "19px" }}></i>
                  <span className="p-0 m-0 px-2">Login with Mobile Number</span>
                </div>
                <div className='col-12 d-flex align-items-center border-top pt-3 justify-content-center'>
                  <span className='mx-auto' style={{ cursor: 'pointer' }} onClick={() => {
                    resetLoginForm();
                    setCurrenctState('login');
                  }}>already have an account - <span className='text-primary text-capitalize'> sign in ? </span></span>
                </div>
              </div>

            </div>

          </form>

          {/* Mobile login form */}
          <form className="col-12 col-lg-8 px-4 pt-5 pb-3 rounded-2" 
                style={{ display: currenctState === 'mobileLogin' ? 'block' : 'none' }} 
                onSubmit={isOtpSent ? handleOtpSubmit : handlePhoneNumberSubmit}>

            <div className='d-flex flex-column align-items-start mb-4'>
              <h3 className='m-0 p-0 fs-2'>Login with mobile</h3>
              <div className='d-flex align-items-center mt-1'>
                <p className='m-0 p-0'>enter your contact number to get code for mobile login</p>
              </div>
            </div>

            <div className='login-form'>

              <div className='input-container'>
                <label htmlFor="email">Mobile number <span className='required-asterik'>*</span> </label>
                <PhoneInput country={"lk"} inputStyle={{ width: "85%" }} disabled={isOtpSent} value={phoneNumber} onChange={(phone) => setPhoneNumber(phone)} />
              </div>

              {
                isOtpSent &&
                <div className='input-container'>
                  <label>Enter OTP</label>
                  <div className="mobile-login-otp">
                    {otp.map((digit, index) => (
                      <input key={index} type="text" id={`otp-input-${index}`} maxLength="1" value={digit} onChange={(e) => handleOtpChange(e.target, index)} />
                    ))}
                  </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <span 
                      onClick={() => { setIsOtpSent(false) }} 
                      style={{ cursor: 'pointer', marginTop: '8px', right: 0 }} 
                      className='mx-2 text-primary text-capitalize'
                    >
                      Edit Mobile Number
                    </span>
                    </div>
                </div>
              }
              

              <div id="recaptcha-container" className="captcha"></div>

              {/* <div className='input-container flex-row'>
                {error && <p className="text-danger">{error}</p>}
                {
                  isOtpSent &&
                  <p onClick={(e) => handleResendOtp(e)} style={{ cursor: counter === 0 ? 'pointer' : 'not-allowed' }}>
                    {counter === 0 ? 'Resend OTP' : `Resend Code in ${counter} seconds`}
                  </p>
                }
                <span className='ms-auto text-capitalize text-primary' style={{ cursor: 'pointer' }} onClick={() => setCurrenctState('forgotPass')}>forgot password ?</span>
              </div> */}

              <div className='input-container'>
                {
                  isOtpSent ?
                    <button type="submit" style={{ fontSize: 10 }} onClick={handleOtpSubmit} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3" disabled={otpVerifyStatus}>{otpVerifyStatus ? 'Verifying' : 'Submit'}</button>
                    : <button type="submit" style={{ fontSize: 10 }} onClick={handlePhoneNumberSubmit} disabled={otpSendingLoading} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3">{otpSendingLoading ? 'Please wait..' : 'Send OTP'}</button>
                }
              </div>

              <div className='border my-3'></div>

              <div className='d-flex align-items-center justify-content-center flex-wrap col-gap-5 login-options-container'>
                <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={handleGoogleHandle}>
                  <img src={googleLogo.src} className='mb-1' style={{ width: '20px', height: '20px' }} />
                  <span className="p-0 m-0 px-2">Login with Google</span>
                </div>
                <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => {
                  resetLoginForm();
                  setCurrenctState('login');
                }}>
                  <i className="fa fa-envelope" style={{ fontSize: "19px" }}></i>
                  <span className="p-0 m-0 px-2">Login with Email</span>
                </div>
                <div className='col-12 d-flex align-items-center border-top pt-3 justify-content-center'>
                  <span className='mx-auto' style={{ cursor: 'pointer' }} onClick={() => {
                    resetRegistrationForm()
                    setCurrenctState('register')}}>don't have account ? <span className='text-primary text-capitalize'> sign up ? </span></span>
                </div>
              </div>

            </div>

          </form>

        </div>

      </section>

      {/* Add responsive styles for iPad Pro */}
      <style jsx global>{`
        /* Hide the reveal password button in Microsoft Edge */
        ::-ms-reveal {
          display: none !important;
        }
        
        /* Hide the clear button in Microsoft Edge */
        ::-ms-clear {
          display: none !important;
        }
        
        /* iPad Pro specific styles (1024 x 1366) */
        @media only screen and (min-width: 1024px) and (max-width: 1366px) {
          /* Hide the banner image on iPad Pro */
          .banner-image-container {
            display: none !important;
          }
          
          .banner-logo-container {
            display: none !important;
          }
          
          /* Adjust the login container to use full width */
          .login-container {
            width: 100% !important;
            max-width: 600px !important;
            margin: 0 auto !important;
            padding: 2rem !important;
          }
          
          /* Center the logo and make it larger */
          .main-logo {
            width: 280px !important;
            margin: 2rem auto !important;
          }
          
          /* Make form elements slightly larger for touch input */
          .login-form input, 
          .login-form .PhoneInput,
          .login-form button {
            height: 50px !important;
            font-size: 16px !important;
          }
          
          /* Adjust input container spacing */
          .input-container {
            margin-bottom: 1.5rem !important;
          }
          
          .input-container label {
            font-size: 16px !important;
            margin-bottom: 8px !important;
          }
          
          /* Adjust OTP input spacing */
          .mobile-login-otp input {
            width: 45px !important;
            height: 45px !important;
            margin: 0 8px !important;
            font-size: 18px !important;
          }
          
          /* Improve button sizing and appearance */
          .login-form button.btn-solid {
            font-size: 16px !important;
            padding: 12px 24px !important;
            width: 100% !important;
            max-width: 400px !important;
            margin: 1.5rem auto !important;
          }
          
          /* Better spacing for login options */
          .login-options-container {
            display: flex !important;
            justify-content: space-around !important;
            margin: 2rem 0 !important;
          }
          
          .login-options-container div {
            font-size: 14px !important;
          }
          
          /* Make section headings more prominent */
          .login-form h3 {
            font-size: 2.5rem !important;
            margin-bottom: 1rem !important;
          }
          
          /* Adjust the passwordVisible-btn position */
          .input-container-password .passwordVisible-btn {
            // top: 5px !important;
            // right: 5px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Login;


// import axios from 'axios';
// import Head from 'next/head';
// import Cookies from 'js-cookie';
// import PhoneInput from 'react-phone-input-2';
// import React, { useContext, useEffect, useRef, useState } from "react";

// import { AppContext } from "../../../_app";

// import ToastMessage from "../../../../components/Notification/ToastMessage";
// import { checkPasswordStrength, googleLogin, loginManual, register } from "../../../../AxiosCalls/UserServices/userServices";
// import googleLogo from '../../../../public/assets/images/Loginimages/googleLogo.png';

// import IconButton from '@mui/material/IconButton';
// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';

// import 'react-phone-input-2/lib/style.css';

// const Login = () => {

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   const timerRef = useRef(null);
//   const { setTriggers, userStatus } = useContext(AppContext);

//   const loginUsernameRef = useRef(null);
//   const loginPassWordRef = useRef(null);
//   const registerUserName = useRef(null);
//   const registerEmailID = useRef(null);
//   const registerPassword = useRef(null);
//   const forgotPassVerifyEmail = useRef(null);
//   const forgotPassVerifyRef = useRef(null);
//   const forgotPassPass = useRef(null);
//   const forgotPassConfirmPass = useRef(null);

//   const [counter, setCounter] = useState(60);
//   const [currenctState, setCurrenctState] = useState('login');

//   const [showPassword, setShowPassword] = useState(false);
//   const [showPasswordRegister, setShowPasswordRegister] = useState(false);
//   const [showPasswordForgotPass, setShowPasswordForgotPass] = useState(false);
//   const [showPasswordForgotConfirmPass, setShowPasswordForgotConfirmPass] = useState(false);
//   const [loginLoading, setLoginLoading] = useState(false);
//   const [isOtpSent, setIsOtpSent] = useState(false);
//   const [otpVerifyStatus, setOtpVerifyStatus] = useState(false);
//   const [otpSendingLoading, setOtpSendingLoading] = useState(false);
//   const [registerLoading, setRegisterLoading] = useState(false);
//   const [loadingForgottPass, setLoadingForgottPass] = useState(false);
//   const [forgotResetProcess, setForgotResetProcess] = useState(false);

//   const [passwordStrength, setPasswordStrength] = useState(0);

//   const [errors, setErrors] = useState([]);

//   const [forgotEmail, setForgotEmail] = useState('');
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [otp, setOtp] = useState(new Array(6).fill(""));

//   const [userRegisterLoginDetails, setUserRegisterLoginDetails] = useState({
//     userName: '',
//     email: '',
//     passWord: ''
//   });

//   const [verifyOTPforgot, setVerifyOTPforgot] = useState({
//     verificationCode: '',
//     passWord: '',
//     confirmPassword: ''
//   });

//   const [forgotEmailStatus, setForgotEmailStatus] = useState({
//     status: false,
//     message: '',
//     statusCode: ''
//   });
//   // manual login

//   const validateForm = () => {

//     if (email === '') {
//       loginUsernameRef.current.style.borderColor = 'red';
//     } else {
//       loginUsernameRef.current.style.borderColor = '#49a764';
//     }

//     if (password === '') {
//       loginPassWordRef.current.style.borderColor = 'red';
//     } else {
//       loginPassWordRef.current.style.borderColor = '#49a764';
//     }

//     if (email === '' && password === '') {
//       setError("Email addresss and password is required");
//       return false;
//     } else if (email === '') {
//       setError("Email addresss is required");
//       return false;
//     } else if (password === '') {
//       setError("Password is required");
//       return false;
//     }

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(email)) {
//       setError("Please enter a valid email address");
//       return false;
//     }

//     return true;

//   };

//   const handleSubmit = async (e) => {

//     e.preventDefault();

//     setLoginLoading(true);
//     setError("");

//     if (!validateForm()) {
//       setLoginLoading(false);
//     } else {
//       try {
//         const registerUser = {
//           userName: email,
//           passWord: password
//         }
//         const result = await loginManual(registerUser);
//         if (result.data.status == 500) {
//           ToastMessage({ status: 'error', message: 'Login failed. Please check your credentials and try again.' })
//         } else if (result.status === 200 && result.data.status === 200) {
//           handleNavigate(result.data.id, result.data.hashed_key);
//           ToastMessage({ status: 'success', message: ` Welcome back  ${registerUser.userName} ` });
//         } else if (result.status === 200 && result.data.status === 401) {
//           ToastMessage({ status: "warning", message: "Verification mail has been sent to your email kindly verify first" })
//         } else if (result.status === 200 && result.data.status === 400) {
//           ToastMessage({ status: "error", message: "The username must be a valid email address." })
//         } else if (result.status === 200 && result.data.status === 404) {
//           ToastMessage({ status: "error", message: "Login failed. Please check your credentials and try again." })
//         }
//       } catch (error) {
//         ToastMessage({ status: "error", message: "Login failed. Please check your credentials and try again." })
//       }
//     }

//     setLoginLoading(false);

//   };

//   // google login
//   const handleGoogleHandle = async () => {
//     // setLoginLoading(true);
//     const result = await googleLogin();
//     if (result?.status === 200 && result?.data?.status === 401) {
//       // setLoginLoading(false)
//       ToastMessage({ status: "error", message: "Your Account Has Been Permanently Deactivated." });
//     } else if (result?.data?.status === 200 && result?.data?.usercount > 0) {
//       // setLoginLoading(false);
//       ToastMessage({ status: 'success', message: `Login successfull` });
//       handleNavigate(result.data.id, result.data.hashed_key);
//     }
//     // setLoginLoading(false);
//   }

//   // register
//   const validateRegisterForm = () => {

//     let result = true;

//     let newErrors = [];

//     if (userRegisterLoginDetails.userName === '') {
//       newErrors.push('Nickname');
//       registerUserName.current.style.borderColor = 'red';
//       result = false;
//     } else if (!/^[a-zA-Z]+$/.test(userRegisterLoginDetails.userName)) {
//       newErrors.push('Nickname must contain only letters.');
//       registerUserName.current.style.borderColor = 'red';
//       result = false;
//     } else {
//       registerUserName.current.style.borderColor = '#49a764';
//     }

//     if (userRegisterLoginDetails.email === '') {
//       newErrors.push('Email');
//       registerEmailID.current.style.borderColor = 'red';
//       result = false;
//     } else if (!emailRegex.test(userRegisterLoginDetails.email)) {
//       newErrors.push('Invalid email format');
//       registerEmailID.current.style.borderColor = 'red';
//       result = false;
//     } else {
//       registerEmailID.current.style.borderColor = '#49a764';
//     }

//     if (userRegisterLoginDetails.passWord === '') {
//       newErrors.push('Password');
//       registerPassword.current.style.borderColor = 'red';
//       result = false;
//     } else if (passwordStrength < 3) {
//       newErrors.push('Please add strong password');
//       registerPassword.current.style.borderColor = 'red';
//       result = false;
//     } else {
//       registerPassword.current.style.borderColor = '#49a764';
//     }

//     setErrors(newErrors);
//     return result;

//   };

//   const submitRegisterForm = async (e) => {

//     e.preventDefault();
//     setRegisterLoading(true);

//     if (validateRegisterForm()) {
//       try {
//         await register(userRegisterLoginDetails).then((result) => {
//           if (result.data.status === 200) {
//             setErrors(['Registration successfull.']);
//             setCurrenctState('login');
//           } else {
//             setErrors(['Registration failed. Please try again.']);
//           }
//         })
//       } catch (error) {
//         setErrors(['An error occurred. Please try again later.'])
//       }
//     }

//     setRegisterLoading(false);

//   };

//   const GeneratePasswordStrengthContainer = () => {
//     return (
//       (userRegisterLoginDetails.passWord.length > 1 && passwordStrength === 0) ?
//         <span style={{ color: "red", fontSize: 12 }}>( Very bad )</span>
//         : (userRegisterLoginDetails.passWord.length > 1 && (passwordStrength === 1 || passwordStrength === 2)) ?
//           <span style={{ color: "orange", fontSize: 12 }}>( Good )</span>
//           : (userRegisterLoginDetails.passWord.length > 1 && passwordStrength >= 3) ?
//             <span style={{ color: "green", fontSize: 12 }}>( Excellent )</span>
//             : null
//     )
//   };

//   // forgot password

//   const handleValidateMail = (value) => {
//     return emailRegex.test(value)
//   }

//   const handleSumitForgotPassword = async (e) => {

//     e.preventDefault();

//     setLoadingForgottPass(true);

//     const formData = {
//       userEmail: forgotEmail
//     }

//     if (!handleValidateMail(forgotEmail)) {
//       setForgotEmailStatus({
//         status: true,
//         message: 'Please verify the mail address',
//         statusCode: '500'
//       });
//       forgotPassVerifyEmail.current.style.borderColor = 'red';
//     } else {
//       forgotPassVerifyEmail.current.style.borderColor = '#49a764';
//       await axios.post('forgot-password-mobile', formData, {
//         xsrfHeaderName: "X-XSRF-TOKEN",
//         withCredentials: true
//       }).then((response) => {
//         if (response.status === 200 && response.data.status === 404) {
//           setForgotEmailStatus({
//             status: true,
//             message: response.data.message,
//             statusCode: '404'
//           });
//           forgotPassVerifyEmail.current.style.borderColor = 'red';
//         } else if (response.status === 200 && response.data.status === 200) {
//           setForgotEmailStatus({
//             status: true,
//             message: 'Password Reset OTP Sent Successfully.',
//             statusCode: '200'
//           });
//         }
//       }).catch((error) => {
//         // console.error(error)
//       });
//     }

//     setLoadingForgottPass(false);

//   }

//   const handleSubmitVerification = (e) => {

//     e.preventDefault();

//     setForgotResetProcess(true);

//     const formData = {
//       token: verifyOTPforgot.verificationCode,
//       userPassword: verifyOTPforgot.passWord,
//       userConfirmPassword: verifyOTPforgot.confirmPassword
//     }

//     axios.post('userreset', formData, {
//       xsrfHeaderName: "X-XSRF-TOKEN",
//       withCredentials: true
//     }).then((response) => {
//       if (response.status === 200 && response.data.status === 200) {
//         setCurrenctState('login');
//         ToastMessage({ status: 'success', message: 'Password reset successfully, kindly login with updated username and password' })
//       } else if (response.status === 200 && response.data.status === 400) {
//         setForgotEmailStatus({
//           status: true,
//           message: 'Verification OTP is not matching.',
//           statusCode: '500'
//         });
//       } else if (response.status === 200 && response.data.status === 401) {
//         setForgotEmailStatus({
//           status: true,
//           message: 'The user confirm password and user password must match.',
//           statusCode: '500'
//         });
//       } else {
//         ToastMessage({ status: 'success', message: 'Something went wrong !' });
//       }
//     }).catch((error) => {
//       // console.error(error)
//     });

//     setForgotResetProcess(false);

//   }

//   const handleNavigate = (id, hashedVal) => {

//     if (userStatus.userLoggesIn) {
//       window.location.assign("/");
//     } else {
//       const dataBack = localStorage.getItem("lastPath");
//       window.location.assign(dataBack || "/");
//       localStorage.removeItem("lastPath");
//     }

//     localStorage.setItem("#__uid", id);
//     Cookies.set('hashedVal', hashedVal, { secure: true, sameSite: 'strict' });

//     setTimeout(() => {
//       setTriggers((prevTriggers) => ({
//         ...prevTriggers,
//         customerCartTrigger: !prevTriggers.customerCartTrigger,
//         baseCurrencyTrigger: !prevTriggers.baseCurrencyTrigger,
//         userLoginTrigger: !prevTriggers.userLoginTrigger,
//         userDesireLocation: !prevTriggers.userDesireLocation,
//       }));
//     }, 0);

//   };

//   const startCounter = () => {
//     timerRef.current = setInterval(() => {
//       setCounter((prevCounter) => {
//         if (prevCounter > 0) {
//           return prevCounter - 1;
//         } else {
//           return prevCounter;
//         }
//       });
//     }, 1000);
//   };

//   const [otpSendOption, setOtpSendOption] = useState('sendVerification');

//   const handlePhoneNumberSubmit = async (e) => {
//     e.preventDefault();
//     setOtpSendingLoading(true);
//     setIsOtpSent(false);
//     try {
//       await axios.post(`/${otpSendOption}`, {
//         mobile_number: phoneNumber,
//       }).then((response) => {
//         setIsOtpSent(true);
//         setCounter(60);
//         startCounter();
//         ToastMessage({ status: "success", message: "OTP sent successfully!" });
//       });
//     } catch (error) {
//       ToastMessage({ status: "error", message: "Failed to send OTP. Please try again." });
//     }
//     setOtpSendingLoading(false);
//   };

//   const handleResendOtp = (e) => {
//     if (counter === 0) {
//       setOtpSendOption('resendVerification');
//       handlePhoneNumberSubmit(e);
//     }
//   }

//   const handleOtpChange = (element, index) => {
//     if (/^\d*$/.test(element.value)) {
//       let newOtp = [...otp];
//       newOtp[index] = element.value;
//       setOtp(newOtp);
//       if (element.nextSibling && element.value) {
//         element.nextSibling.focus();
//       }
//     }
//   };

//   const handleOtpSubmit = async (e) => {

//     e.preventDefault();
//     setOtpVerifyStatus(true);

//     const enteredOtp = otp.join("");

//     const data = {
//       mobile_number: phoneNumber,
//       otp: enteredOtp,
//     };

//     const mobileNum = {
//       mobileNum: phoneNumber,
//     };

//     try {
//       await axios.post("verifyPhoneNumber", data, { xsrfHeaderName: "X-XSRF-TOKEN", withCredentials: true }).then(async (response) => {
//         console.log("OTP verified successfully!", response);
//         if (response.data.status === 200) {
//           console.log("OTP verified successfully!", response);

//           handleNavigate(response.data.id, response.data.hashed_key);
//           ToastMessage({ status: "success", message: "Login success." });
//           // await axios.post("mobile-user", mobileNum, { xsrfHeaderName: "X-XSRF-TOKEN", withCredentials: true }).then((res) => {
//           //   if (res.data.status === 200) {
//           //     handleNavigate(res.data.id, res.data.hashed_key);
//           //     ToastMessage({ status: "success", message: "Login success." });
//           //   } else if (res.data.status === 401) {
//           //     ToastMessage({ status: "error", message: "Your Account Has Been Permanently Deactivated." });
//           //   } else if (res.data.status === 202) {
//           //     handleNavigate(res.data.id, res.data.hashed_key);
//           //     ToastMessage({ status: "success", message: "Your account was temporarily deactivated and has now been reactivated." });
//           //   }
//           // }).catch((error) => {
//           //   ToastMessage({ status: "error", message: "Login failed !" });
//           // });
//         } else {
//           ToastMessage({ status: "error", message: "Login failed !" });
//         }
//       })
//     } catch (err) {
//       console.log("Error verifying OTP:", err);
//       ToastMessage({ status: "error", message: "Something went wrong !." });
//     }
//     setOtpVerifyStatus(false);

//   };

//   useEffect(() => {
//     setError("");
//     setErrors([]);
//   }, [currenctState]);

//   // useEffect(() => {
//   //   return {
//   //     cleanup: () => clearInterval(timerRef.current),
//   //   };
//   // }, []);
 
//   return (

//     <>

//       <Head>
//         <title>Aahaas - Login</title>
//       </Head>

//       <section className='d-flex align-items-center flex-wrap m-0 p-0'>

//         <div className='col-12 d-flex align-items-center justify-content-center d-none d-lg-block' style={{ marginBottom: '-8%', marginLeft: '-12.5%', zIndex: '20' }}>
//           <img src={`/assets/images/iconsAndLogos/aahaas_monoMain.png`} className='d-none' alt="logo" style={{ backgroundColor: 'white', width: '100px', height: 'auto', marginBottom: '-40px', borderRadius: '50%', padding: '10px 10px' }} />
//         </div>

//         <div className='border p-0 d-none d-lg-block'>
//           <img src={`/assets/images/Banners/banner2.png`} alt="logo" style={{ width: '100%', height: '100vh' }} />
//           <img src={`/assets/images/iconsAndLogos/Slogan.png`} className="slogan-image" alt="logo" />
//           <img src={`/assets/images/iconsAndLogos/waveSymbol.png`} className="waveSymbol-image" alt="logo" />
//         </div>

//         <div className='col m-0 p-0 mx-4 mx-sm-5 d-flex flex-column align-items-center'>

//           <img src={`/assets/images/iconsAndLogos/mainLogo.png`} className="mx-auto mb-0 mt-5 mt-sm-0" alt="logo" style={{ width: '220px', height: 'auto' }} />

//           {/* login */}
//           <form className="col-12 col-lg-8 px-0 px-sm-4 pt-5 pb-3 rounded-2" style={{ display: currenctState === 'login' ? 'block' : 'none' }} onSubmit={handleSubmit}>

//             <div className='d-flex flex-column align-items-start mb-4'>
//               <h3 className='m-0 p-0 fs-2'>Welcome back !</h3>
//               <div className='d-flex align-items-center mt-1'>
//                 <p className='m-0 p-0'>wander in, journey on: your passport to adventure awaits !</p>
//               </div>
//             </div>

//             <div className='login-form'>

//               <div className='input-container'>
//                 <label htmlFor="email">Email <span className='required-asterik'>*</span> </label>
//                 <input type="email" ref={loginUsernameRef} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//               </div>

//               <div className='input-container-password'>
//                 <label htmlFor="password">Password <span className='required-asterik'>*</span> </label>
//                 <div>
//                   <input type={showPassword ? "text" : "password"} ref={loginPassWordRef} id="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{}} />
//                   <IconButton className='passwordVisible-btn' onClick={() => setShowPassword(!showPassword)} >{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
//                 </div>
//               </div>

//               <div className='input-container flex-row'>
//                 <p className="text-danger">{error}</p>
//                 <span className='ms-auto text-primary text-capitalize' style={{ cursor: 'pointer' }} onClick={() => setCurrenctState('forgotPass')}>forgot password ?</span>
//               </div>

//               <div className='input-container'>
//                 <button type="submit" onClick={handleSubmit} style={{ fontSize: 10 }} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3" disabled={loginLoading}>{loginLoading ? 'Checking your credentials' : 'Login'}</button>
//               </div>

//               <div className='border my-3'></div>

//               <div className='d-flex align-items-center justify-content-center flex-wrap col-gap-5'>
//                 <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={handleGoogleHandle}>
//                   <img src={googleLogo.src} className='mb-1' style={{ width: '20px', height: '20px' }} />
//                   <span className="p-0 m-0 px-2">Login with Google</span>
//                 </div>
//                 <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => setCurrenctState('mobileLogin')}>
//                   <i className="fa fa-phone" style={{ fontSize: "19px" }}></i>
//                   <span className="p-0 m-0 px-2">Login with Mobile Number</span>
//                 </div>
//                 <div className='col-8 d-flex align-items-center border-top pt-3 justify-content-center'>
//                   <p className='m-0 p-0'>don't have account ?</p>
//                   <span onClick={() => setCurrenctState('register')} style={{ cursor: 'pointer' }} className='mx-2 text-primary text-capitalize'>Sign Up</span>
//                 </div>
//               </div>

//             </div>

//           </form>

//           {/* register */}
//           <form className="col-12 col-lg-8 px-0 px-sm-4 pt-5 pb-3 rounded-2" style={{ display: currenctState === 'register' ? 'block' : 'none' }} onSubmit={submitRegisterForm}>

//             <div className='d-flex flex-column align-items-start mb-4'>
//               <h3 className='m-0 p-0 fs-2'>Enlist for exploration</h3>
//               <div className='d-flex align-items-center mt-1'>
//                 <p className='m-0 p-0'>embark on a world of adventures adventure now and make every journey yours!</p>
//               </div>
//             </div>

//             <div className='login-form'>

//               <div className='input-container'>
//                 <label htmlFor="email">Username <span className='required-asterik'>*</span> </label>
//                 <input type="name" ref={registerUserName} placeholder="Eg : Jone123" name="userName" value={userRegisterLoginDetails.userName} onChange={(e) => setUserRegisterLoginDetails({ ...userRegisterLoginDetails, userName: e.target.value })} required />
//               </div>

//               <div className='input-container'>
//                 <label htmlFor="email">Email <span className='required-asterik'>*</span> </label>
//                 <input type="email" ref={registerEmailID} placeholder="Eg : Johndoe@gmail.com" name="email" value={userRegisterLoginDetails.email} onChange={(e) => setUserRegisterLoginDetails({ ...userRegisterLoginDetails, email: e.target.value })} required />
//               </div>

//               <div className='input-container-password'>
//                 <label htmlFor="email">Password {GeneratePasswordStrengthContainer()}<span className='required-asterik'>*</span> </label>
//                 <div>
//                   <input type={showPasswordRegister ? 'text' : 'password'} ref={registerPassword} placeholder="Eg : JohnDoe@987" name="password" value={userRegisterLoginDetails.passWord}
//                     onChange={(e) => {
//                       const password = e.target.value
//                       setUserRegisterLoginDetails({ ...userRegisterLoginDetails, passWord: password })
//                       setPasswordStrength(checkPasswordStrength(password))
//                     }}
//                     required />
//                   <IconButton className='passwordVisible-btn' onClick={() => setShowPasswordRegister(!showPasswordRegister)} >{showPasswordRegister ? <VisibilityOff /> : <Visibility />}</IconButton>
//                 </div>
//               </div>

//               <div className='input-container flex-row'>
//                 <span className={`${errors.length === 0 ? 'd-none' : 'd-block'}`}  >{errors?.join(' & ').concat('is required.')}</span>
//                 <span className='ms-auto' style={{ cursor: 'pointer' }} onClick={() => setCurrenctState('login')}>already have an account - <span className='text-primary text-capitalize'> sign in ? </span></span>
//               </div>

//               <div className='input-container'>
//                 <button type="submit" onClick={submitRegisterForm} style={{ fontSize: 10 }} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3" disabled={registerLoading}>{registerLoading ? 'Loading...' : 'Create Account'}</button>
//               </div>

//               <div className='border my-3'></div>

//               <div className='d-flex align-items-center justify-content-center flex-wrap col-gap-5'>
//                 <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={handleGoogleHandle}>
//                   <img src={googleLogo.src} className='mb-1' style={{ width: '20px', height: '20px' }} />
//                   <span className="p-0 m-0 px-2">Login with Google</span>
//                 </div>
//                 <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => setCurrenctState('mobileLogin')}>
//                   <i className="fa fa-phone" style={{ fontSize: "19px" }}></i>
//                   <span className="p-0 m-0 px-2">Login with Mobile Number</span>
//                 </div>
//                 <div className='col-12 d-flex align-items-center border-top pt-3 justify-content-center'>
//                   <span className='mx-auto text-primary text-capitalize' style={{ cursor: 'pointer' }} onClick={() => setCurrenctState('forgotPass')}>forgot password ?</span>
//                 </div>
//               </div>

//             </div>

//           </form>

//           {/* forgot password code */}
//           <form className="col-12 col-lg-8 px-0 px-sm-4 pt-5 pb-3 rounded-2" style={{ display: currenctState === 'forgotPass' ? 'block' : 'none' }} onSubmit={forgotEmailStatus.status ? handleSumitForgotPassword : handleSubmitVerification}>

//             <div className='d-flex flex-column align-items-start mb-4'>
//               <h3 className='m-0 p-0 fs-2'>Forgot password</h3>
//               <div className='d-flex align-items-center mt-1'>
//                 <p className='m-0 p-0'>Provide your Aahaas user email to get password reset.</p>
//               </div>
//             </div>

//             <div className='login-form'>

//               {
//                 !forgotEmailStatus.status &&
//                 <div className='input-container'>
//                   <label htmlFor="email">Email <span className='required-asterik'>*</span> </label>
//                   <input type="email" placeholder="Email" value={forgotEmail} ref={forgotPassVerifyEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
//                 </div>
//               }

//               {
//                 forgotEmailStatus.status &&
//                 <div className='input-container'>
//                   <label htmlFor="text">OTP code <span className='required-asterik'>*</span> </label>
//                   <input type="text" placeholder="Please Enter the Verification Code." ref={forgotPassVerifyRef} value={verifyOTPforgot.verificationCode} name='verificationCode' id='verificationCode' onChange={(e) => setVerifyOTPforgot({ ...verifyOTPforgot, verificationCode: e.target.value })} required />
//                 </div>
//               }

//               {
//                 forgotEmailStatus.status &&
//                 <div className='input-container-password'>
//                   <label htmlFor="password">Password <span className='required-asterik'>*</span> </label>
//                   <div>
//                     <input type={showPasswordForgotPass ? "text" : "password"} placeholder="Password." value={verifyOTPforgot.passWord} ref={forgotPassPass} name='passWord' id='passWord' onChange={(e) => setVerifyOTPforgot({ ...verifyOTPforgot, passWord: e.target.value })} required />
//                     <IconButton className='passwordVisible-btn' onClick={() => setShowPasswordForgotPass(!showPasswordForgotPass)} >{showPasswordForgotPass ? <VisibilityOff /> : <Visibility />}</IconButton>
//                   </div>
//                 </div>
//               }

//               {
//                 forgotEmailStatus.status &&
//                 <div className='input-container-password'>
//                   <label htmlFor="confirm password">Confirm password <span className='required-asterik'>*</span> </label>
//                   <div>
//                     <input type={showPasswordForgotConfirmPass ? "text" : "password"} placeholder="Confirm Password." ref={forgotPassConfirmPass} value={verifyOTPforgot.confirmPassword} name='confirmPassword' id='confirmPassword' onChange={(e) => setVerifyOTPforgot({ ...verifyOTPforgot, confirmPassword: e.target.value })} required />
//                     <IconButton className='passwordVisible-btn' onClick={() => setShowPasswordForgotConfirmPass(!showPasswordForgotConfirmPass)} >{showPasswordForgotConfirmPass ? <VisibilityOff /> : <Visibility />}</IconButton>
//                   </div>
//                 </div>
//               }

//               <div className='input-container flex-row'>
//                 <p className={forgotEmailStatus.statusCode === "200" ? "text-success" : "text-danger"}>{forgotEmailStatus.message}</p>
//                 <span className='ms-auto text-primary text-capitalize' style={{ cursor: 'pointer' }} onClick={() => setCurrenctState('register')}>create new account ?</span>
//               </div>

//               <div className='input-container'>
//                 {
//                   forgotEmailStatus.status ?
//                     <button type="submit" onClick={handleSubmitVerification} style={{ fontSize: 10 }} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3" disabled={forgotResetProcess}>{forgotResetProcess ? 'Verifying' : 'Reset Password'}</button>
//                     : <button type="submit" onClick={handleSumitForgotPassword} style={{ fontSize: 10 }} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3" disabled={loadingForgottPass}>{loadingForgottPass ? 'Sending OTP' : 'Send OTP'}</button>
//                 }
//               </div>

//               <div className='border my-3'></div>

//               <div className='d-flex align-items-center justify-content-center flex-wrap col-gap-5'>
//                 <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={handleGoogleHandle}>
//                   <img src={googleLogo.src} className='mb-1' style={{ width: '20px', height: '20px' }} />
//                   <span className="p-0 m-0 px-2">Login with Google</span>
//                 </div>
//                 <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => setCurrenctState('mobileLogin')}>
//                   <i className="fa fa-phone" style={{ fontSize: "19px" }}></i>
//                   <span className="p-0 m-0 px-2">Login with Mobile Number</span>
//                 </div>
//                 <div className='col-12 d-flex align-items-center border-top pt-3 justify-content-center'>
//                   <span className='mx-auto' style={{ cursor: 'pointer' }} onClick={() => setCurrenctState('login')}>already have an account - <span className='text-primary text-capitalize'> sign in ? </span></span>
//                 </div>
//               </div>

//             </div>

//           </form>

//           {/* mobile login */}
//           <form className="col-12 col-lg-8 px-4 pt-5 pb-3 rounded-2" style={{ display: currenctState === 'mobileLogin' ? 'block' : 'none' }} onSubmit={isOtpSent ? handleOtpSubmit : handlePhoneNumberSubmit}>

//             <div className='d-flex flex-column align-items-start mb-4'>
//               <h3 className='m-0 p-0 fs-2'>Login with mobile</h3>
//               <div className='d-flex align-items-center mt-1'>
//                 <p className='m-0 p-0'>enter your contact number to get code for mobile login ?</p>
//               </div>
//             </div>

//             <div className='login-form'>

//               <div className='input-container'>
//                 <label htmlFor="email">Mobile number <span className='required-asterik'>*</span> </label>
//                 <PhoneInput country={"lk"} inputStyle={{ width: "85%" }} disabled={isOtpSent} value={phoneNumber} onChange={(phone) => setPhoneNumber(phone)} />
//               </div>

//               {
//                 isOtpSent &&
//                 <div className='input-container'>
//                   <label>Enter OTP</label>
//                   <div className="mobile-login-otp">
//                     {otp.map((digit, index) => (
//                       <input key={index} type="text" id={`otp-input-${index}`} maxLength="1" value={digit} onChange={(e) => handleOtpChange(e.target, index)} />
//                     ))}
//                   </div>
//                 </div>
//               }

//               <div id="recaptcha-container" className="captcha"></div>

//               <div className='input-container flex-row'>
//                 {error && <p className="text-danger">{error}</p>}
//                 {
//                   isOtpSent &&
//                   <p onClick={(e) => handleResendOtp(e)} style={{ cursor: counter === 0 ? 'pointer' : 'not-allowed' }}>
//                     {counter === 0 ? 'Resend OTP' : `Resend Code in ${counter} seconds`}
//                   </p>
//                 }
//                 <span className='ms-auto text-capitalize text-primary' style={{ cursor: 'pointer' }} onClick={() => setCurrenctState('forgotPass')}>forgot password ?</span>
//               </div>

//               <div className='input-container'>
//                 {
//                   isOtpSent ?
//                     <button type="submit" style={{ fontSize: 10 }} onClick={handleOtpSubmit} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3" disabled={otpVerifyStatus}>{otpVerifyStatus ? 'Verifying' : 'Submit'}</button>
//                     : <button type="submit" style={{ fontSize: 10 }} onClick={handlePhoneNumberSubmit} disabled={otpSendingLoading} className="btn btn-solid col-12 col-lg-8 mx-auto py-2 px-2 rounded-4 mt-2 mt-lg-3">{otpSendingLoading ? 'Please wait..' : 'Send OTP'}</button>
//                 }
//               </div>

//               <div className='border my-3'></div>

//               <div className='d-flex align-items-center justify-content-center flex-wrap col-gap-5'>
//                 <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={handleGoogleHandle}>
//                   <img src={googleLogo.src} className='mb-1' style={{ width: '20px', height: '20px' }} />
//                   <span className="p-0 m-0 px-2">Login with Google</span>
//                 </div>
//                 <div className="d-flex my-1 my-lg-3 mx-0 mx-lg-3 align-items-center" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => setCurrenctState('mobileLogin')}>
//                   <i className="fa fa-phone" style={{ fontSize: "19px" }}></i>
//                   <span className="p-0 m-0 px-2">Login with Mobile Number</span>
//                 </div>
//                 <div className='col-12 d-flex align-items-center border-top pt-3 justify-content-center'>
//                   <span className='mx-auto' style={{ cursor: 'pointer' }} onClick={() => setCurrenctState('login')}>already have an account - <span className='text-primary text-capitalize'> sign in ? </span></span>
//                 </div>
//               </div>

//             </div>

//           </form>

//         </div>

//       </section>

//       <style jsx global>{`
//   /* Hide the reveal password button in Microsoft Edge */
//   ::-ms-reveal {
//     display: none !important;
//   }
  
//   /* Hide the clear button in Microsoft Edge */
//   ::-ms-clear {
//     display: none !important;
//   }
// `}</style>

//     </>
  
    
//   );
// };

// export default Login;
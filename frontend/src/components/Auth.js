import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useState } from "react";
import { useCookies } from "react-cookie";
import * as Yup from "yup";
import "../scss/auth.scss";

function Auth() {
  const [user, setUser] = useOutletContext();
  const [fail, setFail] = useState(null);
  const [, setCookie] = useCookies([
    "access_token",
    "username",
  ]);
  const navigate = useNavigate();

  if (user)
    return (
      <div>
        <h2>You should logout first!</h2>
      </div>
    );

  return (
    <div className="page-content log-in-page">
      <h2>Log in</h2>
      <Formik
        initialValues={{
          username: "",
          password: "",
        }}
        validationSchema={Yup.object({
          username: Yup.string()
            .max(20, "Invalid username")
            .matches(/^[\w_]+$/i, "Invalid username")
            .required("Enter the username"),
          password: Yup.string().required("Enter the password"),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            var m = JSON.stringify(values, null, 2);
            var requestOptions = {
              mode: "cors",
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: m,
            };
            fetch("/api/login", requestOptions)
              .then((response) => response.json())
              .then((data) => {
                if ("access_token" in data) {
                  setFail(false);
                  setCookie("access_token", data.access_token);
                  setCookie("username", values.username);
                  console.log(data.access_token);
                  setSubmitting(false);
                  setUser(values.username);
                  navigate("/");
                } else {
                  setFail(true);
                }
              });
          }, 400);
        }}
      >
        <Form>
          <label htmlFor="username">Username</label>
          <Field name="username" type="text" />
          <ErrorMessage
            name="username"
            render={(msg) => <div className="error">{msg}</div>}
          />
          <label htmlFor="password">Password</label>
          <Field name="password" type="password" />
          <ErrorMessage
            name="password"
            render={(msg) => <div className="error">{msg}</div>}
          />

          <button type="submit">Log in</button>
        </Form>
      </Formik>
      {fail && <p style={{ color: "red" }}>Login failed</p>}
      <p>
        Don't have an account? <Link to="/signup">Sign up</Link> now!
      </p>
    </div>
  );
}

export default Auth;

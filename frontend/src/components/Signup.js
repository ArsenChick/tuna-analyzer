import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useCookies } from "react-cookie";
import * as Yup from "yup";
import "../scss/signup/sign_up.scss";

function Signup() {
  const [user, setUser] = useOutletContext();
  const [cookies, setCookie] = useCookies(["access_token", "username"]);
  const navigate = useNavigate();

  if (cookies.username)
    return (
      <div>
        <h2>You should logout first!</h2>
      </div>
    );

  return (
    <div className="page-content sign-up-page">
      <h2>Sign up to Tuna</h2>
      <Formik
        initialValues={{
          username: "",
          password: "",
          password_confirm: "",
          acceptedTerms: false
        }}
        validationSchema={Yup.object({
          username: Yup.string()
            .max(20, "Must be 20 characters or less")
            .matches(
              /^[\w_]+$/i,
              "Can contain only latin characters and _ symbol"
            )
            .required("Required"),
          password: Yup.string()
            .min(8, "Must be 8-16 characters long")
            .max(16, "Must be 8-16 characters long")
            .required("Required"),
          password_confirm: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Required"),
          acceptedTerms: Yup.bool()
            .oneOf([true], "You must accept the terms and conditions")
            .required("Required")
        })}
        onSubmit={(values, { setSubmitting }) => {
          var m = JSON.stringify(values, null, 2);
          var requestOptions = {
            mode: "cors",
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: m
          };
          fetch("/api/signup", requestOptions)
            .then(response => response.json())
            .then(data => {
              if ("access_token" in data) {
                setCookie("access_token", data.access_token);
                setCookie("username", values.username);
                setSubmitting(false);
                setUser(values.username);
                navigate("/");
              }
            });
        }}
      >
        {formik =>
          <Form>
            <label htmlFor="username">Username</label>
            <Field name="username" type="text" />
            <ErrorMessage
              name="username"
              render={msg =>
                <div className="error">
                  {msg}
                </div>}
            />
            <label htmlFor="password">Password</label>
            <Field name="password" type="password" />
            <ErrorMessage
              name="password"
              render={msg =>
                <div className="error">
                  {msg}
                </div>}
            />
            <label htmlFor="password_confirm">Confirm password</label>
            <Field name="password_confirm" type="password" />
            <ErrorMessage
              name="password_confirm"
              render={msg =>
                <div className="error">
                  {msg}
                </div>}
            />
            <label htmlFor="acceptedTerms">
              <input
                type="checkbox"
                {...formik.getFieldProps("acceptedTerms")}
              />
              I accept the terms and conditions
            </label>
            <ErrorMessage
              name="acceptedTerms"
              render={msg =>
                <div className="error">
                  {msg}
                </div>}
            />

            <button type="submit">Submit</button>
          </Form>}
      </Formik>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default Signup;

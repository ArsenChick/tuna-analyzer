import '../scss/signup.scss';

import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import * as Yup from "yup";

function Signup() {
  const [user, setUser] = useOutletContext();
  const navigate = useNavigate();

  if (user)
    return (
      <div>
        <h2>You should logout first!</h2>
      </div>
    );
  
  return (
    <div>
      <h2>Sign up to Tuna</h2>
      <Formik
        initialValues={{
          username: "",
          password: "",
          passwordConfirm: "",
          acceptedTerms: false,
        }}
        validationSchema={Yup.object({
          username: Yup.string()
            .max(20, "Must be 20 characters or less")
            .matches(/^[\w_]+$/i, "Can contain only latin characters and _ symbol")
            .required("Required"),
          password: Yup.string()
            .min(8, "Must be 8-16 characters long")
            .max(16, "Must be 8-16 characters long")
            .required("Required"),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Required"),
          acceptedTerms: Yup.bool()
            .oneOf([true], "You must accept the terms and conditions")
            .required("Required"),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
            setUser(values.username);
            navigate("/");
          }, 400);
        }}
      >
        {(formik) => (
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
            <label htmlFor="confirmPassword">Confirm password</label>
            <Field name="confirmPassword" type="password" />
            <ErrorMessage
              name="confirmPassword"
              render={(msg) => <div className="error">{msg}</div>}
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
              render={(msg) => <div className="error">{msg}</div>}
            />

            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
      <p>
        Already have an account?{" "}
        <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Signup;
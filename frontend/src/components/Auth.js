import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import * as Yup from "yup";

function Auth() {
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
            alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
            setUser(values.username);
            navigate("/");
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
      <p>
        Don't have an account?{" "}
        <Link to="/signup">Sign up</Link>{" "}now!
      </p>
    </div>
  );
};

export default Auth;
import { render, screen, shallow } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import Analyzer from "./components/Analyzer";
import Auth from "./components/Auth";
import Signup from "./components/Signup";
import History from "./components/History";

test("Example test", () => {
  expect(1).toEqual(1);
});

test("React render Ok", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});

test("History render Ok", () => {
  render(
    <BrowserRouter>
      <App>
        <History />
      </App>
    </BrowserRouter>
  );
});

test("Analyzer render Ok", () => {
  render(
    <BrowserRouter>
      <App>
        <Analyzer />
      </App>
    </BrowserRouter>
  );
});

test("Auth render Ok", () => {
  render(
    <BrowserRouter>
      <App>
        <Auth />
      </App>
    </BrowserRouter>
  );
});

test("Signup render Ok", () => {
  render(
    <BrowserRouter>
      <App>
        <Signup />
      </App>
    </BrowserRouter>
  );
});

test("Render Tuna", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const linkElement = screen.getByText(/Tuna/i);
  expect(linkElement).toBeInTheDocument();
});

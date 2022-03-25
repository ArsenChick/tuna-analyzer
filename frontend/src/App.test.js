import { render, screen, shallow } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

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

test("Render Tuna", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const linkElement = screen.getByText(/Tuna/i);
  expect(linkElement).toBeInTheDocument();
});

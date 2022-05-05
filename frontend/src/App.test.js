import React from "react";
import Enzyme from "enzyme";
import { shallow, mount } from "enzyme";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Cookies from "react-cookie";

Enzyme.configure({ adapter: new Adapter() });

describe("App guest", () => {
  const app = mount(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  it("Check home link", () => {
    expect(app.find("#logo-title").exists()).toBeTruthy();
  });

  it("Check history link", () => {
    expect(app.find("#historyButton").exists()).toBeFalsy();
  });

  it("Check logout button", () => {
    expect(app.find("#logoutButton").exists()).toBeFalsy();
  });

  it("Check login button", () => {
    expect(app.find("#loginButton").exists()).toBeTruthy();
  });
});

describe("App authorized user", () => {
  let app;

  // тут устанавливаем фейковые куки
  // app создаем в каждом тесте чтобы загружались куки
  beforeEach(() => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "username=test; access_token=token;"
    });

    app = mount(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  });

  it("Check home link", () => {
    expect(app.find("#logo-title").exists()).toBeTruthy();
  });

  it("Check history link", () => {
    expect(app.find("#historyButton").exists()).toBeTruthy();
  });

  it("Check logout button", () => {
    expect(app.find("#logoutButton").exists()).toBeTruthy();
  });

  it("Check login button", () => {
    expect(app.find("#loginButton").exists()).toBeFalsy();
  });

  it("Check logout", () => {
    const logout_btn = app.find("#logoutButton");
    expect(logout_btn.exists).toBeTruthy();
    logout_btn.simulate("click");

    expect(app.find("#loginButton").exists()).toBeTruthy();
    expect(app.find("#logoutButton").exists()).toBeFalsy();
    expect(app.find("#historyButton").exists()).toBeFalsy();
  });
});

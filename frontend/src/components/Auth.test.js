import React from "react";
import Enzyme from "enzyme";
import { shallow, mount } from "enzyme";
import { act } from "@testing-library/react"
import Auth from "./Auth";
import { BrowserRouter } from "react-router-dom";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Cookies from "react-cookie";
import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();
Enzyme.configure({ adapter: new Adapter() });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
   useNavigate: () => mockedUsedNavigate,
 }));

describe("Auth guest", () => {
  const app = mount(
    <BrowserRouter>
      <Auth />
    </BrowserRouter>
  );

  it("Check form", () => {
    expect(app.find("#loginForm").exists()).toBeTruthy();
  });

  it("Check history link", () => {
    expect(app.find("#signupLink").exists()).toBeTruthy();
  });

  it("Check bad login", async() => {
    fetch.mockResponseOnce(JSON.stringify({ msg: "NOT OK"}));
    act(() => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: 'test' } });
      app.find("input[name='password']").simulate('change', { persist: () => {}, target: { name: 'password', value: '1234' } });
    });
    await act(() => sleep(200));
    app.update();

    expect(app.find("input[name='username']").html()).toMatch('test');
    expect(app.find("input[name='password']").html()).toMatch('1234');

    act(() => {
        app.find('form').first().simulate('submit', {
          preventDefault: () => {},
      });
    });
    console.log(app.html());
    const calls = mockedUsedNavigate.mock.calls
    expect(calls.length).toEqual(0);
  });

  app.unmount();
  app.mount(<BrowserRouter>
    <Auth />
  </BrowserRouter>);

  it("Check good login", async () => {
    fetch.mockResponseOnce(JSON.stringify({ msg: "OK", "access_token": "token" }));
    act(async () => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: 'test' } });
      app.find("input[name='password']").simulate('change', { persist: () => {}, target: { name: 'password', value: '1234' } });
      expect(app.find("input[name='username']").html()).toMatch('test');
      expect(app.find("input[name='password']").html()).toMatch('1234');
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    const calls = mockedUsedNavigate.mock.calls
    await act(() => sleep(100));
    app.update();
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe("Auth authorized", () => {
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
            <Auth />
        </BrowserRouter>
        );
    });

    

    it("Check form", () => {
      expect(app.find("#loginForm").exists()).toBeFalsy();
    });
  
    it("Check signup link", () => {
      expect(app.find("#signupLink").exists()).toBeFalsy();
    });

    it("Check error message", () => {
        expect(app.find("#authError").exists()).toBeTruthy();
      });
  });
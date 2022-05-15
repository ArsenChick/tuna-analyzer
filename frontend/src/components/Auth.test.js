import React from "react";
import Enzyme from "enzyme";
import { mount } from "enzyme";
import { act, waitFor } from "@testing-library/react"
import Auth from "./Auth";
import { BrowserRouter } from "react-router-dom";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
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
   useOutletContext: () => [0, jest.fn()]
 }));

describe("Auth guest", () => {
  let app = mount(
    <BrowserRouter>
      <Auth />
    </BrowserRouter>
  );

  it("Check form", () => {
    expect(app.find("#loginForm").exists()).toBeTruthy();
  });

  it("Check signup link", () => {
    expect(app.find("#signupLink").exists()).toBeTruthy();
  });


  it("Check empty username", async () => {
    app = mount(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>);
    app.update();
        
    act(() => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: '' } });
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    await waitFor(() => {
      app.update();
      expect(app.html()).toContain('Enter the username');
    });
  });

  it("Check long username", async () => {
    app.unmount();
    app = mount(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>);
    app.update();
        
    act(async () => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: 'abcdefghijklmnopqrstuvwxyz' } });
      await waitFor(() => {
        expect(app.find("input[name='username']").html()).toMatch('abcdefghijklmnopqrstuvwxyz');
      });
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    await waitFor(() => {
      app.update();
      expect(app.html()).toContain('Invalid username')
    });

  });

  it("Check username with wrong chars", async () => {
    app = mount(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>);
    app.update();
    act(async () => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: 'Россия!' } });
      await waitFor(() => {
        expect(app.find("input[name='username']").html()).toMatch('Россия!');
      });
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    await waitFor(() => {
      app.update();
      expect(app.html()).toContain('Invalid username')
    });
  });

  it("Check empty password", async () => {
    app.unmount();
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "username=; access_token=;"
      });
    app = mount(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>);
    app.update();
        
    act(() => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: '' } });
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    await waitFor(() => {
      app.update();
      expect(app.html()).toContain('Enter the password');
    });
  });


  it("Check bad login", async() => {
    fetch.mockResponseOnce(JSON.stringify({ msg: "NOT OK"}));
    act(() => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: 'test1' } });
      app.find("input[name='password']").simulate('change', { persist: () => {}, target: { name: 'password', value: '12345' } });
    });
    await act(() => sleep(100));
    app.update();

    expect(app.find("input[name='username']").html()).toMatch('test1');
    expect(app.find("input[name='password']").html()).toMatch('12345');

    act(() => {
        app.find('form').first().simulate('submit', {
          preventDefault: () => {},
      });
    });
    const calls = mockedUsedNavigate.mock.calls
    expect(calls.length).toEqual(0);
  });

  

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
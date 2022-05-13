import React from "react";
import Enzyme from "enzyme";
import { mount } from "enzyme";
import Signup from "./Signup";
import { BrowserRouter } from "react-router-dom";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { act, waitFor } from "@testing-library/react"
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


describe("Signup guest", () => {
  let app = mount(
    <BrowserRouter>
      <Signup />
    </BrowserRouter>
  );
  it("Check form", () => {
    expect(app.find("#signupForm").exists()).toBeTruthy();
  });


  it("Check empty username", async () => {
    app = mount(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>);
    app.update();
        
    act(() => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: '' } });
      app.find("input[name='password']").simulate('change', { persist: () => {}, target: { name: 'password', value: 'a' } });
      app.find("input[name='password_confirm']").simulate('change', { persist: () => {}, target: { name: 'password', value: 'a' } });
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    await waitFor(() => {
      app.update();
      expect(app.html()).toContain('Required');
    });
  });

  it("Check long username", async () => {
    app = mount(
      <BrowserRouter>
        <Signup />
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
      expect(app.html()).toContain('Must be 20 characters or less')
    });

  });

  it("Check username with wrong chars", async () => {
    app = mount(
      <BrowserRouter>
        <Signup />
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
      expect(app.html()).toContain('Can contain only latin characters and _ symbol')
    });
  });

  it("Check empty password", async () => {
    app = mount(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>);
    app.update();
        
    act(() => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: 'mrTwister' } });
      app.find("input[name='password']").simulate('change', { persist: () => {}, target: { name: 'password', value: '' } });
      app.find("input[name='password_confirm']").simulate('change', { persist: () => {}, target: { name: 'password', value: 'a' } });
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    await waitFor(() => {
      app.update();
      expect(app.html()).toContain('Required');
    });
  });

  it("Check long password", async () => {
    app = mount(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>);
    app.update();
        
    act(async () => {
      app.find("input[name='password']").simulate('change', { persist: () => {}, target: { name: 'password', value: 'abcdefghijklmnopqrstuvwxyz' } });
      await waitFor(() => {
        expect(app.find("input[name='password']").html()).toMatch('abcdefghijklmnopqrstuvwxyz');
      });
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    await waitFor(() => {
      app.update();
      expect(app.html()).toContain('Must be 8-16 characters long')
    });

  });

  it("Check empty password_confirm", async () => {
    app = mount(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>);
    app.update();
        
    act(() => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: 'mrTwister' } });
      app.find("input[name='password']").simulate('change', { persist: () => {}, target: { name: 'password', value: 'aaaaaaaaa' } });
      app.find("input[name='password_confirm']").simulate('change', { persist: () => {}, target: { name: 'password', value: '' } });
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    await waitFor(() => {
      app.update();
      expect(app.html()).toContain('Required');
    });
  });

  it("Check bad password_confirm", async () => {
    app = mount(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>);
    app.update();
        
    act(async () => {
      app.find("input[name='password']").simulate('change', { persist: () => {}, target: { name: 'password', value: 'bekis' } });
      app.find("input[name='password_confirm']").simulate('change', { persist: () => {}, target: { name: 'password_confirm', value: 'kekis' } });
      await waitFor(() => {
        expect(app.find("input[name='password']").html()).toMatch('bekis');
        expect(app.find("input[name='password_confirm']").html()).toMatch('kekis');
      });
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    await waitFor(() => {
      app.update();
      expect(app.html()).toContain('Passwords must match')
    });

  });

  it("Check unaccepted conditions", async () => {
    app = mount(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>);
    app.update();
        
    act(() => {
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    await waitFor(() => {
      app.update();
      expect(app.html()).toContain('You must accept the terms and conditions');
    });
  });



  it("Check bad signup", async () => {
    fetch.mockResponseOnce(JSON.stringify({ msg: "NOT OK"}));
    act(() => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: 'test1' } });
      app.find("input[name='password']").simulate('change', { persist: () => {}, target: { name: 'password', value: '12345' } });
      app.find("input[name='password_confirm']").simulate('change', { persist: () => {}, target: { name: 'password_confirm', value: '12345' } });
      app.find("input[name='acceptedTerms']").simulate('change', { persist: () => {}, target: { name: 'acceptedTerms', value: true } });
    });
    await act(() => sleep(100));
    app.update();

    expect(app.find("input[name='username']").html()).toMatch('test1');
    expect(app.find("input[name='password']").html()).toMatch('12345');
    expect(app.find("input[name='password_confirm']").html()).toMatch('12345');
    expect(app.find("input[name='acceptedTerms']").html()).toMatch('true');

    act(() => {
        app.find('form').first().simulate('submit', {
          preventDefault: () => {},
      });
    });
    await act(() => sleep(100));
    const calls = mockedUsedNavigate.mock.calls
    expect(calls.length).toEqual(0);
  });

  it("Check good signup", async () => {
    fetch.mockResponseOnce(JSON.stringify({ msg: "OK", "access_token": "token" }));
    act(() => {
      app.find("input[name='username']").simulate('change', { persist: () => {}, target: { name: 'username', value: 'test1' } });
      app.find("input[name='password']").simulate('change', { persist: () => {}, target: { name: 'password', value: '12345' } });
      app.find("input[name='password_confirm']").simulate('change', { persist: () => {}, target: { name: 'password_confirm', value: '12345' } });
      app.find("input[name='acceptedTerms']").simulate('change', { persist: () => {}, target: { name: 'acceptedTerms', value: true } });
      app.find('form').first().simulate('submit', {
        preventDefault: () => {},
      });
    });
    const calls = mockedUsedNavigate.mock.calls
    waitFor(() => {expect(calls.length).toBeGreaterThan(0)});
  });
});

describe("Signup authorized", () => {
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
            <Signup />
        </BrowserRouter>
        );
    });
    it("Check error", () => {
      expect(app.find("#ErrorMessage").exists()).toBeTruthy();
    });
  });
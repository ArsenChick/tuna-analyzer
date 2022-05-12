import React from "react";
import Enzyme from "enzyme";
import { act } from "@testing-library/react"
import { mount } from "enzyme";
import History from "./History";
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
 }));

describe("History guest", () => {
  const app = mount(
    <BrowserRouter>
      <History />
    </BrowserRouter>
  );
  const calls = mockedUsedNavigate.mock.calls
  it("Check redirect", () => {
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe("History authorized", () => {
    let app;
    const data = {
        msg: "OK",
        "ids": []
    };
    // тут устанавливаем фейковые куки
    // app создаем в каждом тесте чтобы загружались куки
    beforeEach(() => {
        Object.defineProperty(document, "cookie", {
        writable: true,
        value: "username=test; access_token=token;"
        });
    });

    it("Check empty uploads", async () => {
      fetch.mockResponseOnce(JSON.stringify(data));
      app = mount(<History />);
      await act(() => sleep(100));
      app.update();
      //console.log(app.html());
      expect(app.find("#noSaves").exists()).toBeTruthy();
    }
    )
    it("Check uploads and delete", async () => {
      fetch
      .once(JSON.stringify({ msg: "OK", "ids": [1] }))
      .once(JSON.stringify({ msg: 'OK', filename: 'test' }))
      .once(JSON.stringify({ msg: 'OK', 
        bpm: 1,
        tone: 1,
        dance: 1,
        energy: 1,
        happiness: 1,
        version: 0,
        date: "Sun, 08 May 2022 15:22:55 GMT" }))
      .once(JSON.stringify({ msg: "OK", "ids": [] }));
      app = mount(<History />);
      await act(() => sleep(100));
      app.update();
      expect(app.find("#noSaves").exists()).toBeFalsy();
      expect(app.find("#resultTable").exists()).toBeTruthy();
      expect(app.text()).toContain("08 May 2022");


      app.find("#delete1").simulate('click');
      await act(() => sleep(100));
      app.update();
      expect(app.find("#noSaves").exists()).toBeTruthy();
    })

    it("Check uploads and download", async () => {
      
      fetch
      .once(JSON.stringify({ msg: "OK", "ids": [1] }))
      .once(JSON.stringify({ msg: 'OK', filename: 'test' }))
      .once(JSON.stringify({ msg: 'OK', 
        bpm: 1,
        tone: 1,
        dance: 1,
        energy: 1,
        happiness: 1,
        version: 0,
        date: "Sun, 08 May 2022 15:22:55 GMT" }))
      .once(JSON.stringify({ msg: "OK", file: {"filename": 'test.mp3', content:'aaaa'} }));
      app = mount(<History />);
      await act(() => sleep(100));
      app.update();
      expect(app.find("#noSaves").exists()).toBeFalsy();
      expect(app.find("#resultTable").exists()).toBeTruthy();
      expect(app.text()).toContain("08 May 2022");

      app.find("#download1").simulate('click');
      let wasClicked = false;
      HTMLAnchorElement.prototype.click = jest.fn(() => (wasClicked = true));
      await act(() => sleep(100));
      expect(wasClicked).toBeTruthy();
      
    })

    it("Check upload and pagination", async () => {
      const data = {
        msg: 'OK', 
        filename: 'test',
        bpm: 1,
        tone: 1,
        dance: 1,
        energy: 1,
        happiness: 1,
        version: 0,
        date: "Sun, 08 May 2022 15:22:55 GMT" 
      }
      fetch
      .once(JSON.stringify({ msg: "OK", "ids": [1, 2, 3, 4, 5, 6] }))
      .once(JSON.stringify(data))
      .once(JSON.stringify(data))
      .once(JSON.stringify(data))
      .once(JSON.stringify(data))
      .once(JSON.stringify(data))
      .once(JSON.stringify(data))
      .once(JSON.stringify(data))
      .once(JSON.stringify(data))
      .once(JSON.stringify(data))
      .once(JSON.stringify(data))
      .once(JSON.stringify({ msg: 'OK', 
        filename: 'test6',
        bpm: 6,
        tone: 1,
        dance: 1,
        energy: 1,
        happiness: 1,
        version: 0,
        date: "Sun, 09 May 2022 15:22:55 GMT" }))
      .once(JSON.stringify({ msg: 'OK', 
        filename: 'test',
        bpm: 6,
        tone: 1,
        dance: 1,
        energy: 1,
        happiness: 1,
        version: 0,
        date: "Sun, 09 May 2022 15:22:55 GMT" }))

      app = mount(<History />);
      await act(() => sleep(100));
      app.update();
      expect(app.find("#noSaves").exists()).toBeFalsy();
      expect(app.find("#resultTable").exists()).toBeTruthy();

      app.find("#page2").simulate('click');
      await act(() => sleep(100));

      app.update();
      expect(app.text()).toContain("09 May 2022");
    })
});
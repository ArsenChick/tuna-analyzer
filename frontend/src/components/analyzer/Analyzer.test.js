/* eslint-disable testing-library/no-debugging-utils */
import React from "react";
import Enzyme from "enzyme";
import { act } from "@testing-library/react";
import { shallow, mount } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { enableFetchMocks } from "jest-fetch-mock";

import "../../mocks/mockWebAudio";
import Analyzer from "./Analyzer";
import vars from "../../variables";

import { DragAndDrop } from "./DragAndDrop";
import { Hint } from "./Hint";

jest.mock("../../scripts/audioUtils");
jest.mock("../../scripts/fileUtils");

Enzyme.configure({ adapter: new Adapter() });
enableFetchMocks();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockedRow = [
  <td className="record-tone">{120}</td>,
  <td className="record-key">C# minor</td>,
  <td className="record-happiness">{5}</td>,
  <td className="record-aggressiveness">{5}</td>,
  <td className="record-danceability">{5}</td>,
];
const file1 = new File([new ArrayBuffer(5)], "sound.mp3", {
  type: "audio/mpeg",
});
const file2 = new File(["bar"], "whistle.ogg", { type: "audio/ogg" });
const invalidFile = new File(["sus"], "amogus.txt", { type: "text/plain" });

describe("App in guest mode", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Analyzer />)
      .dive()
      .dive()
      .dive();
  });

  it("should render properly", async () => {
    expect(wrapper.exists(".analyzer-page")).toBeTruthy();
    expect(wrapper.exists(".results-history")).toBeFalsy();
  });

  it("and create workers", () => {
    const workers = wrapper.instance().workers;
    const keyBpmWr = workers.keyBpm;
    const extractWr = workers.featureExtraction;
    const moodWrs = workers.moodInference;

    [keyBpmWr, extractWr, moodWrs].forEach((worker) => {
      expect(worker).toBeTruthy();
    });

    vars.moodModelNames.forEach((mood) => {
      expect(moodWrs[mood]).toBeTruthy();
    });
  });

  it("and delete them when unmounted", () => {
    const terminateSpy = jest.spyOn(Worker.prototype, "terminate");
    wrapper.unmount();
    expect(terminateSpy.mock.calls.length).toEqual(5);
  });

  it("should execute file analyzing", async () => {
    wrapper.instance().handleUpload(file1);
    expect(wrapper.exists(".results-history .record-row")).toBeTruthy();
    expect(
      wrapper
        .find(".results-history .record-row")
        .at(0)
        .containsAllMatchingElements([
          <td>sound.mp3</td>,
          <td key="2">Loading...</td>,
        ])
    ).toBeTruthy();

    const promise = wrapper.instance().analyzesInQueue[0];
    expect(promise).toBeTruthy();
    await promise;

    expect(
      wrapper
        .find(".results-history .record-row")
        .at(0)
        .containsAllMatchingElements([<td>sound.mp3</td>, ...mockedRow])
    ).toBeTruthy();
  });

  it("should queue when uploading several files", async () => {
    wrapper.instance().handleUpload(file1);
    wrapper.instance().handleUpload(file2);
    expect(wrapper.find(".results-history .record-row").length).toEqual(2);
    expect(
      wrapper
        .find(".results-history .record-row")
        .at(1)
        .containsAllMatchingElements([
          <td>whistle.ogg</td>,
          <td key="2">Waiting...</td>,
        ])
    ).toBeTruthy();

    const promise = wrapper.instance().analyzesInQueue[1];
    expect(promise).toBeTruthy();
    await promise;

    expect(
      wrapper
        .find(".results-history .record-row")
        .at(1)
        .containsAllMatchingElements([<td>whistle.ogg</td>, ...mockedRow])
    ).toBeTruthy();
  });
});

describe("App in guest mode w/ Drag&Drop and Hint", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<Analyzer />);
  });

  it("should render Hint properly and handle click", async () => {
    expect(wrapper.exists(Hint)).toBeTruthy();
    expect(wrapper.exists(".hint-modal-window._active")).toBeFalsy();

    wrapper.find(".hint-button").simulate("click");
    expect(wrapper.exists(".hint-modal-window._active")).toBeTruthy();
  });

  it("should analyze file when selecting via Drag&Drop", async () => {
    expect(wrapper.exists(DragAndDrop)).toBeTruthy();
    wrapper
      .find('input[type="file"]')
      .simulate("change", { target: { files: [file1] } });
    await act(() => sleep(10));
    wrapper.update();

    expect(wrapper.exists(".results-history .record-row")).toBeTruthy();
    expect(
      wrapper
        .find(".results-history .record-row")
        .at(0)
        .containsAllMatchingElements([
          <td>sound.mp3</td>,
          <td key="2">Loading...</td>,
        ])
    ).toBeTruthy();

    const promise = wrapper.childAt(0).childAt(0).instance().analyzesInQueue[0];
    expect(promise).toBeTruthy();
    await promise;
    wrapper.update();

    expect(
      wrapper
        .find(".results-history .record-row")
        .at(0)
        .containsAllMatchingElements([<td>sound.mp3</td>, ...mockedRow])
    ).toBeTruthy();
  });

  it("shouldn't analyze when selecting invalid file", async () => {
    wrapper
      .find('input[type="file"]')
      .simulate("change", { target: { files: [invalidFile] } });
    await act(() => sleep(10));
    wrapper.update();
    expect(wrapper.exists(".results-history .record-row")).toBeFalsy();
  });

  it("should queue when uploading several files", async () => {
    wrapper
      .find('input[type="file"]')
      .simulate("change", { target: { files: [file1, file2] } });
    await act(() => sleep(10));
    wrapper.update();

    expect(wrapper.find(".results-history .record-row").length).toEqual(2);
    expect(
      wrapper
        .find(".results-history .record-row")
        .at(1)
        .containsAllMatchingElements([
          <td>whistle.ogg</td>,
          <td key="2">Waiting...</td>,
        ])
    ).toBeTruthy();

    const promise = wrapper.childAt(0).childAt(0).instance().analyzesInQueue[1];
    expect(promise).toBeTruthy();
    await promise;
    wrapper.update();

    expect(
      wrapper
        .find(".results-history .record-row")
        .at(1)
        .containsAllMatchingElements([<td>whistle.ogg</td>, ...mockedRow])
    ).toBeTruthy();
  });
});

describe("App in authorized mode", () => {
  let wrapper;

  beforeEach(() => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "username=test; access_token=token;",
    });

    wrapper = shallow(<Analyzer />)
      .dive()
      .dive()
      .dive();
  });

  afterEach(() => {
    fetch.resetMocks();
  });

  it("should execute file analyzing and save result", async () => {
    fetch.mockResponseOnce(JSON.stringify({ msg: "Upload done" }));
    wrapper.instance().handleUpload(file1);

    expect(wrapper.exists(".results-history .record-row")).toBeTruthy();
    expect(
      wrapper
        .find(".results-history .record-row")
        .at(0)
        .containsAllMatchingElements([
          <td>sound.mp3</td>,
          <td key="2">Loading...</td>,
          <td className="record-saved">Waiting...</td>,
        ])
    ).toBeTruthy();

    const analyzePromise = wrapper.instance().analyzesInQueue[0];
    expect(analyzePromise).toBeTruthy();
    await analyzePromise;

    expect(
      wrapper
        .find(".results-history .record-row")
        .at(0)
        .containsAllMatchingElements([
          <td>sound.mp3</td>,
          ...mockedRow,
          <td className="record-saved">Saving...</td>,
        ])
    ).toBeTruthy();

    const savePromise = wrapper.instance().currentInSend;
    expect(savePromise).toBeTruthy();
    await savePromise;

    expect(
      wrapper
        .find(".results-history .record-row")
        .at(0)
        .contains(<td className="record-saved">Saved</td>)
    ).toBeTruthy();
  });

  it("should show error on failed file save", async () => {
    fetch.mockResponseOnce(JSON.stringify({ msg: "422 Invalid JSON data" }));
    wrapper.instance().handleUpload(file1);

    const analyzePromise = wrapper.instance().analyzesInQueue[0];
    expect(analyzePromise).toBeTruthy();
    await analyzePromise;

    const savePromise = wrapper.instance().currentInSend;
    expect(savePromise).toBeTruthy();
    await savePromise;

    expect(
      wrapper
        .find(".results-history .record-row")
        .at(0)
        .contains(<td className="record-saved">Error</td>)
    ).toBeTruthy();
  });

  it("should queue and save when uploading several files", async () => {
    fetch.mockResponse(JSON.stringify({ msg: "Upload done" }));
    wrapper.instance().handleUpload(file1);
    wrapper.instance().handleUpload(file2);
    expect(wrapper.find(".results-history .record-row").length).toEqual(2);
    expect(
      wrapper
        .find(".results-history .record-row")
        .at(1)
        .containsAllMatchingElements([
          <td>whistle.ogg</td>,
          <td key="2">Waiting...</td>,
        ])
    ).toBeTruthy();

    const promise = wrapper.instance().analyzesInQueue[1];
    expect(promise).toBeTruthy();
    await promise;

    const savePromise = wrapper.instance().currentInSend;
    expect(savePromise).toBeTruthy();
    await savePromise;

    expect(fetch.mock.calls.length).toEqual(2);
    wrapper.find(".results-history .record-row").forEach((w) => {
      expect(w.contains(<td className="record-saved">Saved</td>)).toBeTruthy();
    });
  });
});

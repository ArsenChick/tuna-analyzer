import React from "react";
import Enzyme from "enzyme";
import { mount } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

import { DragAndDrop } from "./DragAndDrop";

Enzyme.configure({ adapter: new Adapter() });

const mockUploadFunc = jest.fn(() => {});
const file1 = new File(["foo"], "sound.mp3", { type: "audio/mpeg" });
const file2 = new File(["bar"], "sound.ogg", { type: "audio/ogg" });
const file3 = new File(["hey"], "sound.wav", { type: "audio/wav" });
const invalidFile = new File(["sus"], "amogus.txt", { type: "text/plain" });

describe("Drag and Drop tests", () => {
  const wrapper = mount(<DragAndDrop dropFunction={mockUploadFunc} />);

  it("should render properly", () => {
    expect(wrapper.exists("#dnd-container")).toBeTruthy();
    expect(wrapper.exists(".dnd-select-button")).toBeTruthy();
    expect(wrapper.exists('input[type="file"]')).toBeTruthy();
  });

  it("should change state when dragging", () => {
    wrapper.simulate("dragenter", { dataTransfer: { files: [file1] } });
    expect(wrapper.exists("#dnd-container-active")).toBeTruthy();
    expect(wrapper.exists(".dnd-select-button")).toBeFalsy();
    expect(wrapper.exists('input[type="file"]')).toBeFalsy();

    wrapper.simulate("dragleave", { dataTransfer: { files: [file1] } });
    expect(wrapper.exists("#dnd-container")).toBeTruthy();
    expect(wrapper.exists(".dnd-select-button")).toBeTruthy();
    expect(wrapper.exists('input[type="file"]')).toBeTruthy();
  });

  it("should call fn from props when file is dropped", () => {
    wrapper.simulate("dragenter", { dataTransfer: { files: [file1] } });
    wrapper.simulate("drop", { dataTransfer: { files: [file1] } });
    setTimeout(() => {
      expect(mockUploadFunc.mock.calls.length).toEqual(1);
    }, 10);
  });

  it("should call fn from props many times when multiple files are dropped", () => {
    wrapper.simulate("dragenter", {
      dataTransfer: { files: [file1, file2, file3] },
    });
    wrapper.simulate("drop", {
      dataTransfer: { files: [file1, file2, file3] },
    });
    setTimeout(() => {
      expect(mockUploadFunc.mock.calls.length).toEqual(3);
    }, 10);
  });

  it("shouldn't call fn from props when dropping file of invalid format", () => {
    wrapper.simulate("dragenter", {
      dataTransfer: { files: [file1, invalidFile, file3] },
    });
    wrapper.simulate("drop", {
      dataTransfer: { files: [file1, invalidFile, file3] },
    });
    setTimeout(() => {
      expect(mockUploadFunc.mock.calls.length).not.toBeGreaterThan(0);
    }, 10);
  });

  it("should also display message about invalid file format", () => {
    expect(
      wrapper.findWhere((node) => node.text() === "Unsupported format")
    ).toBeTruthy();
  });
});

describe("File select tests", () => {
  const wrapper = mount(<DragAndDrop dropFunction={mockUploadFunc} />);

  const inputElement = wrapper.find("input");

  it("should trigger click on input when button is clicked", () => {
    const inputClickSpy = jest.spyOn(HTMLInputElement.prototype, "click");
    wrapper.find("button").simulate("click");
    expect(inputClickSpy).toHaveBeenCalled();
  });

  it("should call fn from props when file is selected", () => {
    inputElement.simulate("change", { target: { files: [file1] } });
    setTimeout(() => {
      expect(mockUploadFunc.mock.calls.length).toEqual(1);
    }, 10);
  });

  it("should call fn from props many times when multiple files are dropped", () => {
    inputElement.simulate("change", {
      target: { files: [file1, file2, file3] },
    });
    setTimeout(() => {
      expect(mockUploadFunc.mock.calls.length).toEqual(3);
    }, 10);
  });

  it("shouldn't call fn from props when dropping file of invalid format", () => {
    inputElement.simulate("change", {
      dataTransfer: { files: [file1, invalidFile, file3] },
    });
    setTimeout(() => {
      expect(mockUploadFunc.mock.calls.length).not.toBeGreaterThan(0);
    }, 10);
  });

  it("should also display message about invalid file format", () => {
    expect(
      wrapper.findWhere((node) => node.text() === "Unsupported format")
    ).toBeTruthy();
  });
});

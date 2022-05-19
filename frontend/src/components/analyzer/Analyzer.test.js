/* eslint-disable testing-library/no-debugging-utils */
import React from "react";
import Enzyme from "enzyme";
import { shallow, mount } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { enableFetchMocks } from "jest-fetch-mock";

import "../../mocks/mockWebAudio";
import Analyzer from './Analyzer';
import vars from "../../variables";

jest.mock("../../scripts/audioUtils");
jest.mock("../../scripts/fileUtils");

Enzyme.configure({ adapter: new Adapter() });
enableFetchMocks();

describe.only("App in guest mode", () => {
  let wrapper;
  let trueComponent;

  beforeEach(() => {
    wrapper = shallow(<Analyzer />);
    trueComponent = wrapper.dive().dive().dive();
  });

  it("should render properly", () => {
    expect(wrapper.find(".analyzer-page")).toBeTruthy();
  });

  it("and create workers", () => {
    const workers = trueComponent.instance().workers;
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
});

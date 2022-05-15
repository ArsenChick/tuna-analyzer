import React from "react";
import Enzyme from "enzyme";
import { shallow, mount } from "enzyme";
import { act } from "@testing-library/react"
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { enableFetchMocks } from 'jest-fetch-mock';

Enzyme.configure({ adapter: new Adapter() });
enableFetchMocks();

jest.mock("./mockWorker");
describe.only("App in guest mode", () => {

});
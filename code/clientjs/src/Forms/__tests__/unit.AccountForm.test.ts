import { AccountForm } from "../AccountForm";
import { XrmMockGenerator } from "xrm-mock";

describe("AccountForm.onload", () => {
  beforeEach(() => {
    XrmMockGenerator.initialise();
  });

  it("Handles null values", () => {
    // Arrange
    const context = XrmMockGenerator.getEventContext();
    const websiteMock = XrmMockGenerator.Attribute.createString("websiteurl", undefined);
    websiteMock.controls.itemCollection[0].setNotification = jest.fn();
    websiteMock.controls.itemCollection[0].clearNotification = jest.fn();
    // Act
    AccountForm.onload(context);
    websiteMock.fireOnChange();
  });

  it("notifies invalid website addresses", () => {
    const context = XrmMockGenerator.getEventContext();
    const websiteMock = XrmMockGenerator.Attribute.createString("websiteurl", "foobar");
    websiteMock.controls.itemCollection[0].setNotification = jest.fn();
    AccountForm.onload(context);
    websiteMock.fireOnChange();
    expect(websiteMock.controls.itemCollection[0].setNotification).toBeCalled();
  });

  it("clears notification on valid website address", () => {
    const context = XrmMockGenerator.getEventContext();
    const websiteMock = XrmMockGenerator.Attribute.createString("websiteurl", "foo");
    websiteMock.controls.itemCollection[0].setNotification = jest.fn();
    websiteMock.controls.itemCollection[0].clearNotification = jest.fn();
    AccountForm.onload(context);
    websiteMock.fireOnChange();
    expect(websiteMock.controls.itemCollection[0].setNotification).toBeCalledWith(expect.any(String), "websiteurl");

    websiteMock.value = "https://learn.develop1.net";
    websiteMock.fireOnChange();
    expect(websiteMock.controls.itemCollection[0].clearNotification).toBeCalledWith("websiteurl");
  });
});

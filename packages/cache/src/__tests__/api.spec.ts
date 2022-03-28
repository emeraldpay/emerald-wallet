import {EmeraldStateManager} from "../api";
import {tempPath} from "./_commons";


describe("API Access", () => {

  test("open", async () => {
    let state = new EmeraldStateManager(tempPath("open"));
  });

  test("open and close", async () => {
    let state = new EmeraldStateManager(tempPath("open"));
    state.close();
  });

})



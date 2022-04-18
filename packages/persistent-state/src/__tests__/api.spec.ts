import {PersistentStateImpl} from "../api";
import {tempPath} from "./_commons";


describe("API Access", () => {

  test("open", async () => {
    let state = new PersistentStateImpl(tempPath("open"));
  });

  test("open and close", async () => {
    let state = new PersistentStateImpl(tempPath("open"));
    state.close();
  });

})



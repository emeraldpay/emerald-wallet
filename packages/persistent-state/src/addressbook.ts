import {createDateReviver, EmeraldStateManager, neonToPromise, PageResult} from "./api";

/**
 * Addressbook Item details
 */
export interface AddressbookItem {
  id?: string | undefined;
  address: {
    type: "plain" | "xpub";
    address: string;
  };
  blockchain: number;
  label?: string | undefined;
  description?: string | undefined;
  createTimestamp?: Date | undefined;
  updateTimestamp?: Date | undefined;
}

/**
 * Criteria to select address book records when queried
 */
export interface Filter {
  /**
   * Filter by blockchain
   */
  blockchain?: string | undefined;
}

export class Addressbook {
  private manager: EmeraldStateManager;

  constructor(manager: EmeraldStateManager) {
    this.manager = manager;
  }

  /**
   * Add or update existing transaction in the storage
   * @param item
   */
  add(item: AddressbookItem): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.addressbook_add(
          JSON.stringify(item),
          neonToPromise(resolve, reject)
        );
      } catch (e) {
        reject(e)
      }
    });
  }

  remove(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.addressbook_remove(
          id,
          neonToPromise(resolve, reject)
        );
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * Find transactions under the specified criteria
   * @param filter
   */
  query(filter?: Filter): Promise<PageResult<AddressbookItem>> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.addon.addressbook_query(
          JSON.stringify(filter),
          neonToPromise(resolve, reject, createDateReviver(["createTimestamp", "updateTimestamp"]))
        );
      } catch (e) {
        reject(e)
      }
    });
  }

}

import {Ethereum} from "../ethereum";
import ClassicParams from './ClassicParams';

class Classic extends Ethereum {
  params = new ClassicParams();
}

export default Classic;

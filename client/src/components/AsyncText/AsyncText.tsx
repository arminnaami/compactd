import * as React from "react";
import Map from 'models/Map';
import { getDatabase, getHttpDatabase } from "app/database";
import PouchDB from 'pouchdb';

export interface AsyncTextProps {
  docId: string;
  dbName: string;
  keyName: string;
  pouch?: 'http' | 'local' | 'socket';
}

export default class AsyncText extends React.Component<AsyncTextProps, {resolved: Map<string>}>{
  constructor () {
    super();
    this.state = {resolved: {}};
  }
  async getPouch (props = this.props) {
    switch (this.props.pouch || 'http') {
      case 'http':
        return getHttpDatabase(props.dbName);
      case 'local':
        return new PouchDB(props.dbName);
      case 'socket':
        return getDatabase(props.dbName);
    }
  }
  async load (props = this.props) {
    const pouch = await this.getPouch(props);
    const doc = await pouch.get(props.docId) as any;
    this.setState({
      resolved: {
        ...this.state.resolved,
        [doc._id]: doc[props.keyName]
      }
    });
  }
  componentDidMount () {
    if (this.props.docId) {
      this.load();
    }
  }
  componentWillReceiveProps (nextProps: AsyncTextProps) {
    if (nextProps.docId !== this.props.docId) {
      this.load(nextProps);
    }
  }
  render () {
    if (this.state.resolved[this.props.docId]) {
      return <div>{this.state.resolved[this.props.docId]}</div>;
    }
    return <div></div>
  }
}
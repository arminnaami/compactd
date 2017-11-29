import * as React from 'react';
import * as classnames from 'classnames';
import {Album, DSAlbum, albumURI, Artist, DSArtist, artistURI} from 'compactd-models';
import BetterImage from '../BetterImage';
import * as pluralize from 'pluralize';
import Artwork from 'app/Artwork';
import LibraryItemComp from '../LibraryItemComponent';
import LibraryProvider from 'app/LibraryProvider';
import * as path from 'path';
import './ArtistComponent.scss';

interface ArtistComponentProps {
  id: string,
  subtitle?: 'counters' | 'text' | 'none' | 'artist';
  subtitleText?: string;
}

export default class ArtistComponent extends LibraryItemComp<ArtistComponentProps, {
  artist: Artist,
  counters: number[]
}> {
  private feeds: number[];

  renderSubtitle(): JSX.Element | string{
    const {id, subtitle} = this.props;
    const {counters, artist} = this.state;
    switch (subtitle) {
      case 'counters': 
        if (counters && counters.length === 2) {
          return `${counters[0]} albums · ${counters[1]} tracks`
        }
        return <div className="pt-skeleton">00 albums · 00 tracks</div>
      case 'text': 
        return this.props.subtitleText;
    }
  }

  loadImage(id: string, img: HTMLImageElement): void {
    if (this.isUsingEmbeddedArtworks()) {
      Artwork.getInstance().load(id, this.getImageSizings(), this.image);
    }
  }
  loadCounters (id: string) {
    if (this.props.subtitle === 'counters') {
      const provider = LibraryProvider.getInstance();
      provider.getArtistCounters(id).then((counters) => {
        this.setState({counters});
      })
    }
  }
  loadItem(id: string): void {
    const provider = LibraryProvider.getInstance();
    this.feeds = [
      provider.liveFeed<Artist>('artists', id, (artist) => {
        if (id === this.props.id) {
          this.setState({artist});
          this.loadCounters(id);
        }
      })
    ]
  }
  
  unloadItem(): void {
    const provider = LibraryProvider.getInstance();
    provider.cancelFeeds(this.feeds);
    if (this.isUsingEmbeddedArtworks()) {
      URL.revokeObjectURL(this.image.src);
    }
  }
  getClassNames(): string[] {
    return ['artist-component'];
  }
  renderHeader(): string | JSX.Element {
    if (this.state.artist) {
      return this.state.artist.name;
    } else {
      return <div className="pt-skeleton">Artist name</div>
    }
  }

  isUsingEmbeddedArtworks (props = this.props) {
    const {id, layout} = props;
    return (id && layout !== 'minimal' ) && id.startsWith('library/');
  }

}
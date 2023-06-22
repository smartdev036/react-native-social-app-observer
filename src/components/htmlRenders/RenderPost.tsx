import React, { FC, useMemo } from 'react';
import { Post } from '../../models/articles';
import { Dimensions } from 'react-native';
import { customHTMLElementModels, ignoredDomTags, systemFonts, useClassStyles, useTagsStyles } from '../../constants';
import { Element } from 'domutils/node_modules/domhandler';
import { Node, RenderHTMLConfigProvider, RenderHTMLSource, TRenderEngineProvider } from 'react-native-render-html';
import { ElementType } from 'domelementtype';
import { appendChild, replaceElement } from 'domutils';
import { htmlRenderers } from '../../utils/renders';

class PostManager {
  //TODO ver o tipo deste element
  onElement(e: Element) {
    if (e.tagName === 'span' && e.attribs?.class === 'big-number') {
      const bigNumber = new Element('div', { class: 'bigNumber' });
      bigNumber.children = e.children;
      replaceElement(e, bigNumber);
    }
    if (e.tagName === 'ul' && e.children && e.children.length) {
      for (const c of e.children) {
        if (c.name === 'li') {
          c.attribs.class = 'ul-li';
        }
      }
    }
    return e;
  }
}

class LongFormManager extends PostManager {
  public document = {
    headerNumber: 0,
  };

  onElement(e: Element) {
    const postElement = super.onElement(e);
    if (postElement.tagName === 'h1') {
      this.document.headerNumber++;
      const headerNumberC = new Element('div', { class: 'headerNumberContainer' });
      const headerNumber = new Element('span', { class: 'headerNumber' });
      const newNode = new Node(ElementType.Text);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      newNode.data = String(this.document.headerNumber);
      headerNumber.children = [newNode];
      e.attribs.class = 'headerText';
      headerNumberC.children = [headerNumber, e];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      replaceElement(e, headerNumberC);
    }
    return postElement;
  }
}

class FactCheckManager extends PostManager {
  onElement(e: Element) {
    const postElement = super.onElement(e);
    let factCheck;
    const wrapper = new Element('div', { style: 'width: 20%; margin-top: 20px' });
    switch ((postElement?.prev as Element)?.attribs?.class) {
      case 'fact-check_errado':
        factCheck = new Element('img', {
          src: 'https://observador.pt/wp-content/themes/observador-child/assets/build/img/fact-check/fact_check-errado1x1.png',
        });
        break;
      case 'fact-check_certo':
        factCheck = new Element('img', {
          src: 'https://observador.pt/wp-content/themes/observador-child/assets/build/img/fact-check/fact_check-certo1x1.png',
        });
        break;
      case 'fact-check_enganador':
        factCheck = new Element('img', {
          src: 'https://observador.pt/wp-content/themes/observador-child/assets/build/img/fact-check/fact_check-enganador1x1.png',
        });
        break;
      case 'fact-check_esticado':
        factCheck = new Element('img', {
          src: 'https://observador.pt/wp-content/themes/observador-child/assets/build/img/fact-check/fact_check-esticado1x1.png',
        });
        break;
      case 'fact-check_inconclusivo':
        factCheck = new Element('img', {
          src: 'https://observador.pt/wp-content/themes/observador-child/assets/build/img/fact-check/fact_check-inconclusivo1x1.png',
        });
        break;
      case 'fact-check_praticamente_certo':
        factCheck = new Element('img', {
          src: 'https://observador.pt/wp-content/themes/observador-child/assets/build/img/fact-check/fact_check-praticamente_certo1x1.png',
        });
        break;
    }
    if (factCheck) {
      appendChild(wrapper, factCheck);
      appendChild(postElement, wrapper);
    }
    return postElement;
  }
}

export const RenderPostHtml: FC<{
  post: Post;
  children?: React.ReactNode[] | JSX.Element | JSX.Element[];
}> = ({ post, children }) => {
  const width = useMemo(() => Dimensions.get('screen').width, []);
  const tagsStyles = useTagsStyles();
  const classStyles = useClassStyles(post.type);

  let manager = new PostManager();
  let onElement = (e: Element) => manager.onElement(e);
  switch (post.type) {
    case 'obs_longform':
      // eslint-disable-next-line no-case-declarations
      manager = new LongFormManager();
      // eslint-disable-next-line no-case-declarations
      const hasNumericHeadings = post.options.find(o => o.name === 'show_heading_numbers' && o.value === true) !== undefined;
      if (hasNumericHeadings) {
        onElement = e => manager.onElement(e);
      }
      break;
    case 'obs_factcheck':
      manager = new FactCheckManager();
      onElement = e => manager.onElement(e);
      break;
  }

  const renderContent = useMemo(() => {
    const postBlocks = post.postBlocks ?? [];
    const config = { renderers: htmlRenderers(postBlocks) };
    const content = children ? children : <RenderHTMLSource contentWidth={width} source={{ html: post.body }} />;
    return <RenderHTMLConfigProvider {...config}>{content}</RenderHTMLConfigProvider>;
  }, [children, post.body, post.postBlocks, width]);

  return (
    <TRenderEngineProvider
      classesStyles={classStyles}
      tagsStyles={tagsStyles}
      systemFonts={systemFonts}
      ignoredDomTags={ignoredDomTags}
      customHTMLElementModels={customHTMLElementModels}
      enableExperimentalMarginCollapsing={true}
      enableExperimentalBRCollapsing={true}
      enableExperimentalGhostLinesPrevention={true}
      domVisitors={{ onElement }}
    >
      {renderContent}
    </TRenderEngineProvider>
  );
};

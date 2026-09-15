/**
 * Route change capture for the data router: one `nav/route_change` entry per
 * location change (from, to, matched route ids), and the logger's `route`
 * context kept current so every other entry says which screen it came from.
 */

import { logger } from '@/shared/logging/logger';

/** The subset of a react-router data router this needs (keeps tests light). */
export interface SubscribableRouter {
  state: RouterStateLike;
  subscribe: (listener: (state: RouterStateLike) => void) => () => void;
}

interface RouterStateLike {
  location: { pathname: string; search: string; hash: string; key: string };
  historyAction: string;
  matches: { route: { id: string } }[];
}

const pathOf = (location: RouterStateLike['location']): string =>
  `${location.pathname}${location.search}${location.hash}`;

export const installNavigationCapture = (router: SubscribableRouter): (() => void) => {
  let previous = router.state.location;
  logger.setRoute(pathOf(previous));
  logger.info('nav', 'initial_route', {
    to: pathOf(previous),
    routes: router.state.matches.map((match) => match.route.id),
  });

  return router.subscribe((state) => {
    if (state.location.key === previous.key) {
      return;
    }
    const from = pathOf(previous);
    const to = pathOf(state.location);
    previous = state.location;
    logger.setRoute(to);
    logger.event(
      'nav',
      'route_change',
      {
        from,
        to,
        action: state.historyAction,
        routes: state.matches.map((match) => match.route.id),
      },
      { msg: `Navigated ${from} → ${to}` }
    );
  });
};

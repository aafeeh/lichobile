import layout from '../layout';
import i18n from '../../i18n';
import { header } from '../shared/common';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import helper from '../helper';
import { renderBoard } from '../round/view/roundView';
import m from 'mithril';

export default function view(ctrl) {
  return layout.board(
    header.bind(undefined, i18n('training')),
    renderContent.bind(undefined, ctrl),
    () => [renderPromotion(ctrl)]
  );

}

function renderContent(ctrl) {
  if (!ctrl.data) return;

  if (helper.isPortrait())
    return [
      renderExplanation(ctrl),
      renderBoard(ctrl),
      ctrl.data.mode === 'view' ? renderViewTable(ctrl) : renderPlayerTable(ctrl),
      renderActionsBar(ctrl)
    ];
  else
    return [
      renderBoard(ctrl)
    ];
}

function renderExplanation(ctrl) {
  return (
    <section className="trainingTable">
      <p className="findit">
        {i18n(ctrl.data.puzzle.color === 'white' ? 'findTheBestMoveForWhite' : 'findTheBestMoveForBlack')}
      </p>
    </section>
  );
}

function renderPlayerTable(ctrl) {
  return (
    <section className="trainingTable">
      <div className="yourTurn">
        {i18n(ctrl.chessground.data.turnColor === ctrl.data.puzzle.color ? 'yourTurn' : 'waiting')}
      </div>
      {renderCommentary(ctrl)}
      {renderResult(ctrl)}
    </section>
  );
}

function renderViewTable(ctrl) {
  return (
    <section className="trainingTable">
      <div />
      {renderResult(ctrl)}
    </section>
  );
}


function renderActionsBar(ctrl) {
  var vdom = [
    m('button.training_action.fa.fa-ellipsis-h', {
      key: 'puzzleMenu'
    })
  ];
  if (ctrl.data.mode === 'view') {
    Array.prototype.push.apply(vdom, renderViewControls(ctrl));
  } else {
    vdom.push(
      m('button.training_action[data-icon=b]', {
        key: 'giveUpPuzzle',
        config: helper.ontouch(ctrl.giveUp, () => window.plugins.toast.show(i18n('giveUp'), 'short', 'bottom'))
      })
    );
  }
  return m('section#training_actions', vdom);
}

function renderViewControls(ctrl) {
  var history = ctrl.data.replay.history;
  var step = ctrl.data.replay.step;
  return [
    m('button.training_action[data-icon=G]', {
      key: 'continueTraining',
      config: helper.ontouch(ctrl.newPuzzle, () => window.plugins.toast.show(i18n('continueTraining'), 'short', 'bottom'))
    }),
    !(ctrl.data.attempt && ctrl.data.attempt.win || ctrl.data.win) ? m('button.training_action[data-icon=P]', {
      key: 'retryPuzzle',
      config: helper.ontouch(ctrl.retry, () => window.plugins.toast.show(i18n('retryThisPuzzle'), 'short', 'bottom'))
    }) : null,
    ctrl.data.puzzle.gameId ? m('button.training_action[data-icon=v]', {
      config: helper.ontouch(
        () => m.route(`/game/${ctrl.data.puzzle.gameId}/${ctrl.data.puzzle.color}`),
        () => window.plugins.toast.show(i18n('fromGameLink', ctrl.data.puzzle.gameId), 'short', 'bottom')
      )
    }) : null,
    m('button.training_action[data-icon=I]', {
      config: helper.ontouch(ctrl.jumpPrev),
      className: helper.classSet({
        disabled: !(step !== step - 1 && step - 1 >= 0 && step - 1 < history.length)
      })
    }),
    m('button.training_action[data-icon=H]', {
      config: helper.ontouch(ctrl.jumpNext),
      className: helper.classSet({
        disabled: !(step !== step + 1 && step + 1 >= 0 && step + 1 < history.length)
      })
    })
  ];
}


function renderCommentary(ctrl) {
  switch (ctrl.data.comment) {
    case 'retry':
      return m('div.puzzleComment.retry', [
        m('h3.puzzleState', m('strong', i18n('goodMove'))),
        m('span', i18n('butYouCanDoBetter'))
      ]);
    case 'great':
      return m('div.puzzleComment.great', [
        m('h3.puzzleState.withIcon[data-icon=E]', m('strong', i18n('bestMove'))),
        m('span', i18n('keepGoing'))
      ]);
    case 'fail':
      return m('div.puzzleComment.fail', [
        m('h3.puzzleState.withIcon[data-icon=k]', m('strong', i18n('puzzleFailed'))),
        ctrl.data.mode === 'try' ? m('span', i18n('butYouCanKeepTrying')) : null
      ]);
    default:
      return ctrl.data.comment;
  }
}

function renderRatingDiff(diff) {
  return m('strong.rating', diff > 0 ? '+' + diff : diff);
}

function renderWin(ctrl, attempt) {
  return m('div.puzzleComment.win', [
    m('h3.puzzleState.withIcon[data-icon=E]', [
      m('strong', i18n('victory')),
      attempt ? renderRatingDiff(attempt.userRatingDiff) : null
    ]),
    attempt ? m('span', i18n('puzzleSolvedInXSeconds', attempt.seconds)) : null
  ]);
}

function renderLoss(ctrl, attempt) {
  return m('div.puzzleComment.loss',
    m('h3.puzzleState.withIcon[data-icon=k]', [
      m('strong', i18n('puzzleFailed')),
      attempt ? renderRatingDiff(attempt.userRatingDiff) : null
    ])
  );
}

function renderResult(ctrl) {
  switch (ctrl.data.win) {
    case true:
      return renderWin(ctrl, null);
    case false:
      return renderLoss(ctrl, null);
    default:
      switch (ctrl.data.attempt && ctrl.data.attempt.win) {
        case true:
          return renderWin(ctrl, ctrl.data.attempt);
        case false:
          return renderLoss(ctrl, ctrl.data.attempt);
      }
  }
}

function renderFooter(ctrl) {
  if (ctrl.data.mode !== 'view') return null;
  var fen = ctrl.data.replay.history[ctrl.data.replay.step].fen;
  return m('div', [
    renderViewControls(ctrl, fen)
  ]);
}

function renderHistory(ctrl) {
  return m('div.history', {
    // config: function(el, isUpdate, context) {
    //   var hash = ctrl.data.user.history.join('');
    //   if (hash == context.hash) return;
    //   context.hash = hash;
    //   $.ajax({
    //     url: '/training/history',
    //     cache: false,
    //     success: function(html) {
    //       el.innerHTML = html;
    //     }
    //   });
    // }
  });
}

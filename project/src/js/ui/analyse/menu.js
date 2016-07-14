import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import gameApi from '../../lichess/game';
import helper from '../helper';
import m from 'mithril';

export default {

  controller: function(root) {
    let isOpen = false;

    function open() {
      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open: open,
      close: close,
      isOpen: function() {
        return isOpen;
      },
      root
    };
  },

  view: function(ctrl) {
    return popupWidget(
      'analyse_menu',
      null,
      renderAnalyseMenu.bind(undefined, ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

function renderAnalyseMenu(ctrl) {

  const sharePGN = helper.ontouch(
    ctrl.sharePGN,
    () => window.plugins.toast.show('Share PGN', 'short', 'bottom')
  );

  return m('div.analyseMenu', [
    m('button', {
      key: 'startNewAnalysis',
      config: helper.ontouch(ctrl.startNewAnalysis)
    }, [m('span[data-icon=A].withIcon'), i18n('startNewAnalysis')]),
    ctrl.source === 'offline' || !gameApi.playable(ctrl.data) ? m('button[data-icon=U]', {
      key: 'continueFromHere',
      config: helper.ontouch(() => ctrl.continuePopup.open(ctrl.vm.step.fen))
    }, i18n('continueFromHere')) : null,
    ctrl.source === 'offline' || !gameApi.playable(ctrl.data) ? m('button', {
      key: 'boardEditor',
      config: helper.ontouch(() => m.route(`/editor/${encodeURIComponent(ctrl.vm.step.fen)}`))
    }, [m('span.fa.fa-pencil'), i18n('boardEditor')]) : null,
    ctrl.source === 'offline' || !gameApi.playable(ctrl.data) ? m('button', {
      key: 'sharePGN',
      config: sharePGN
    }, [m('span.fa.fa-share-alt'), i18n('sharePGN')]) : null,
    m('button', {
      key: 'importPGN',
      config: helper.ontouch(() => {
        ctrl.menu.close();
        ctrl.importPgnPopup.open();
      })
    }, [m('span.fa.fa-upload'), i18n('importGame')]),
    ctrl.notes ? m('button', {
      key: 'notes',
      config: helper.ontouch(() => {
        ctrl.menu.close();
        ctrl.notes.open();
      })
    }, [m('span.fa.fa-pencil'), i18n('notes')]) : null
  ]);
}


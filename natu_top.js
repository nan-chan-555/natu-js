document.addEventListener("DOMContentLoaded", function() {
    // ユーザー設定の取得（変数名を 'settings' に統一しました！）
    const settings = window.natuSettings || {};
    
    // --- トップ画像URLの自動設定（日本語URL対応版） ---
    if (settings.topImage) {
        var headerTop = document.getElementById('header_top');
        if (headerTop) {
            // encodeURI() を使って日本語URLの文字化け（エラー）を防ぎます
            headerTop.style.backgroundImage = 'url("' + encodeURI(settings.topImage) + '")';
        }
    }

    // cate1 〜 cate4 までをループ処理
    for (let id in settings) {
        // もし設定項目が 'cate' から始まらないもの（topImageなど）だったらスキップする安全対策
        if (!id.startsWith('cate')) continue;

        let url = settings[id];
        
        // URLが空欄の場合は処理をスキップ
        if (!url) continue;

        // 【1】IDで指定された要素（念のための互換性維持）
        let elById = document.getElementById(id);
        if (elById) {
            elById.href = url;
        }
        
        // 【2】クラスで指定された複数の要素（PCナビ・スマホナビ・ピックアップ全てを一括変更）
        let classElements = document.querySelectorAll('.set-' + id);
        classElements.forEach(function(el) {
            el.href = url;
        });
    }
    
    // ハンバーガーメニューの開閉処理
    $('#hamburger-btn, #close-btn, #menu-overlay').on('click', function() {
        $('#slide-menu').toggleClass('active');
        $('#menu-overlay').toggleClass('active');
    });
});

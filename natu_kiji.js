document.addEventListener("DOMContentLoaded", function() {
    // ユーザー設定の読み込み
    const settings = window.natuSettings || {};
    
    // --- 1. メニューURLの一括設定 ---
    for (let id in settings) {
        if (!id.startsWith('cate')) continue;
        let url = settings[id];
        if (!url) continue;

        // ID指定用（互換性維持）
        let elById = document.getElementById(id);
        if (elById) elById.href = url;
        
        // クラス指定用（メニューなどの複数箇所を一括変更）
        let classElements = document.querySelectorAll('.set-' + id);
        classElements.forEach(function(el) {
            el.href = url;
        });
    }
    
    // --- 2. ハンバーガーメニューの開閉処理 ---
    var hamBtn = document.getElementById('hamburger-btn');
    var clsBtn = document.getElementById('close-btn');
    var slideMenu = document.getElementById('slide-menu');
    var menuOverlay = document.getElementById('menu-overlay');
    if(hamBtn && clsBtn && slideMenu && menuOverlay) {
        var toggleMenu = function() {
            slideMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
        };
        hamBtn.addEventListener('click', toggleMenu);
        clsBtn.addEventListener('click', toggleMenu);
        menuOverlay.addEventListener('click', toggleMenu);
    }

    // --- 3. コメント欄の開閉アコーディオン ---
    var commentBtn = document.getElementById('toggle-comment-btn');
    var commentBox = document.getElementById('js-comment-accordion-box');
    if (commentBtn && commentBox) {
        commentBtn.addEventListener('click', function() {
            if (commentBox.style.display === 'none') {
                commentBox.style.display = 'block';
            } else {
                commentBox.style.display = 'none';
            }
        });
    }
});


// ==========================================
// jQuery必須の個別記事専用処理
// ==========================================
if (typeof jQuery !== 'undefined') {
    jQuery(function($) {
        const settings = window.natuSettings || {};
        
        // --- 目次生成 (TOC) のデータ準備 ---
        var idcount = 1;
        var toc = '';
        var currentlevel = 0;
        // 本文エリア(.main)の中の見出しを確実にスキャンします
        $(".main h2, .main h3").each(function() {
            this.id = "toc-" + idcount;
            idcount++;
            var level = (this.nodeName.toLowerCase() == "h2") ? 1 : 2;
            while (currentlevel < level) { toc += "<ol>"; currentlevel++; }
            while (currentlevel > level) { toc += "</ol>"; currentlevel--; }
            toc += '<li><a href="#' + this.id + '">' + $(this).html() + "</a></li>\n";
        });
        while (currentlevel > 0) { toc += "</ol>"; currentlevel--; }

        // --- はてなブログカード化 ＆ カテゴリータグ付与 ---
        var isCategoryAdded = false;
        $('.main').each(function(){
            var html = $(this).html();
            // URLのブログカード化
            html = html.replace(/(<[^>]+>)|(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, function(match, tag, url) {
                if (tag) return tag;
                return '<iframe class="hatenablogcard" style="width:100%;height:155px;max-width:680px;" src="https://hatenablog-parts.com/embed?url=' + url + '" frameborder="0" scrolling="no"></iframe>';
            });
            
            // カテゴリータグの自動移動
            if (settings.hasCategory) {
                var categoryHtml = '<div class="modern-cat-tag"><span class="cat-label"><i class="fas fa-folder"></i> カテゴリー</span> <a href="' + settings.categoryUrl + '">' + settings.categoryName + '</a></div>';
                var tagRegex = /タグ[ 　]*[:：]/; 
                
                if (tagRegex.test(html)) {
                    html = html.replace(tagRegex, categoryHtml + '<div class="modern-cat-tag"><span class="cat-label"><i class="fas fa-tags"></i> タグ</span> ');
                    html += '</div>';
                    isCategoryAdded = true;
                }
            }
            $(this).html(html);
        });
        
        if (settings.hasCategory && !isCategoryAdded) {
            $('.main:last').append('<div class="modern-cat-tag"><span class="cat-label"><i class="fas fa-folder"></i> カテゴリー</span> <a href="' + settings.categoryUrl + '">' + settings.categoryName + '</a></div>');
        }

        // --- 画像のクラス追加 ---
        $('img').addClass('imgclass');

        // --- 読了時間の算出 ---
        const MIN_CHAR = 500;
        var blogText = $('.main').text();
        var readTime = Math.max(1, Math.floor(blogText.length / MIN_CHAR));
        $('#read-cnt-area').html('<span style="color: #666; font-size: 13px;"><i class="far fa-clock"></i> この記事は約' + readTime + '分で読めます</span>');

        // --- LINE風コメント欄の管理者振り分け ---
        var myAdminName = settings.adminName || "管理者"; 
        var $bodies = $('.line-chat-box .comments-body');
        
        $('.line-chat-box .comments-post').each(function(index) {
            var $post = $(this);
            var $body = $bodies.eq(index); 
            if ($body.length === 0) return;

            var text = $post.text() || "";
            
            // 本文と情報を1つの見えない箱で包み、アイコン位置を調整する
            var $wrapper = $('<div class="line-comment-wrapper"></div>');
            $body.before($wrapper);
            $wrapper.append($body).append($post);

            // 投稿者名に設定した管理者名が含まれるかでクラスを振り分け
            if (text.indexOf(myAdminName) !== -1) {
                $body.addClass('line-bubble-admin');
                $post.addClass('line-meta-admin');
            } else {
                $body.addClass('line-bubble-user');
                $post.addClass('line-meta-user');
            }
        });

        // --- 記事内 吹き出し自動生成スクリプト ---
        var personA = settings.personA || { name: "Aさん", img: "" };
        var personB = settings.personB || { name: "Bさん", img: "" };

        // class="chat-a" をAさん（左）の吹き出しに自動変換
        $('.chat-a').each(function() {
            var text = $(this).html();
            $(this).replaceWith(
                '<div class="balloon-box">' +
                    '<div class="balloon-icon"><img src="' + personA.img + '" alt=""><p>' + personA.name + '</p></div>' +
                    '<div class="balloon-text">' + text + '</div>' +
                '</div>'
            );
        });

        // class="chat-b" をBさん（右）の吹き出しに自動変換
        $('.chat-b').each(function() {
            var text = $(this).html();
            $(this).replaceWith(
                '<div class="balloon-box is-right">' +
                    '<div class="balloon-icon"><img src="' + personB.img + '" alt=""><p>' + personB.name + '</p></div>' +
                    '<div class="balloon-text">' + text + '</div>' +
                '</div>'
            );
        });

        // --- ★最終処理：目次の生成と配置の最適化 ---
        if ($(".main h2").length > 0) {
            // 1. 元の場所にある空の#tocを完全に削除（消去）
            $("#toc").remove();
            
            // 2. 最初のH2の直前に、中身の入った目次を新しく作成して直接挿入（新設）
            var completeTocHtml = '<div id="toc"><div class="mokuji">目次</div>' + toc + '</div>';
            $(".main h2").first().before(completeTocHtml);
        } else {
            // 万が一、記事内にH2見出しが1つもない場合は、元の位置にそのまま表示
            $("#toc").html('<div class="mokuji">目次</div>' + toc);
        }
    });
}

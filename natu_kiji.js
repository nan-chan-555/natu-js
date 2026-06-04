document.addEventListener("DOMContentLoaded", function() {
    // ユーザー設定の読み込み
    const settings = window.natuSettings || {};
    
    // --- 1. メニューURLの一括設定 ---
    for (let id in settings) {
        if (!id.startsWith('cate')) continue;
        let url = settings[id];
        if (!url) continue;

        let elById = document.getElementById(id);
        if (elById) elById.href = url;
        
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

        // ==========================================
        // 1. 目次データの事前作成（HTMLが書き換わる前に記憶）
        // ==========================================
        var idcount = 1;
        var tocList = '';
        var currentlevel = 0;
        var $headings = $(".main").find("h2, h3");
        
        if ($headings.length > 0) {
            $headings.each(function() {
                // H2に直接IDを付与（この後の書き換えでも保持されます）
                var newId = "toc-head-" + idcount++;
                $(this).attr('id', newId);
                
                var level = (this.tagName.toUpperCase() === "H2") ? 1 : 2;
                while (currentlevel < level) { tocList += "<ol>"; currentlevel++; }
                while (currentlevel > level) { tocList += "</ol>"; currentlevel--; }
                
                tocList += '<li><a href="#' + newId + '">' + $(this).text() + "</a></li>\n";
            });
            while (currentlevel > 0) { tocList += "</ol>"; currentlevel--; }
        }

        // ==========================================
        // 2. はてなブログカード化 ＆ カテゴリータグ付与
        // ==========================================
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
            $(this).html(html); // 書き換え完了
        });
        
        if (settings.hasCategory && !isCategoryAdded) {
            $('.main:last').append('<div class="modern-cat-tag"><span class="cat-label"><i class="fas fa-folder"></i> カテゴリー</span> <a href="' + settings.categoryUrl + '">' + settings.categoryName + '</a></div>');
        }

        // ==========================================
        // 3. 画像クラス、読了時間、LINEコメント、吹き出しの処理
        // ==========================================
        $('img').addClass('imgclass');

        const MIN_CHAR = 500;
        var blogText = $('.main').text();
        var readTime = Math.max(1, Math.floor(blogText.length / MIN_CHAR));
        $('#read-cnt-area').html('<span style="color: #666; font-size: 13px;"><i class="far fa-clock"></i> この記事は約' + readTime + '分で読めます</span>');

        var myAdminName = settings.adminName || "管理者"; 
        var $bodies = $('.line-chat-box .comments-body');
        
        $('.line-chat-box .comments-post').each(function(index) {
            var $post = $(this);
            var $body = $bodies.eq(index); 
            if ($body.length === 0) return;

            var text = $post.text() || "";
            var $wrapper = $('<div class="line-comment-wrapper"></div>');
            $body.before($wrapper);
            $wrapper.append($body).append($post);

            if (text.indexOf(myAdminName) !== -1) {
                $body.addClass('line-bubble-admin');
                $post.addClass('line-meta-admin');
            } else {
                $body.addClass('line-bubble-user');
                $post.addClass('line-meta-user');
            }
        });

        var personA = settings.personA || { name: "Aさん", img: "" };
        var personB = settings.personB || { name: "Bさん", img: "" };

        $('.chat-a').each(function() {
            var text = $(this).html();
            $(this).replaceWith('<div class="balloon-box"><div class="balloon-icon"><img src="' + personA.img + '" alt=""><p>' + personA.name + '</p></div><div class="balloon-text">' + text + '</div></div>');
        });

        $('.chat-b').each(function() {
            var text = $(this).html();
            $(this).replaceWith('<div class="balloon-box is-right"><div class="balloon-icon"><img src="' + personB.img + '" alt=""><p>' + personB.name + '</p></div><div class="balloon-text">' + text + '</div></div>');
        });

        // ==========================================
        // 4. 目次の最終配置（すべての処理が終わった最後！）
        // ==========================================
        if (tocList !== '') {
            // テンプレ上部にある不要な空箱を削除
            $("#toc").remove();
            
            // 最新のHTMLの中から、最初の見出しを探す
            var $targetHeading = $(".main").find("h2, h3").first();
            
            if ($targetHeading.length > 0) {
                var completeTocHtml = '<div id="toc"><div class="mokuji">目次</div>' + tocList + '</div>';
                // 最初の見出しの「直前」に挿入する
                $targetHeading.before(completeTocHtml);
            }
        } else {
            // 見出しが1つもない場合は空箱だけ消す
            $("#toc").remove();
        }
    });
}

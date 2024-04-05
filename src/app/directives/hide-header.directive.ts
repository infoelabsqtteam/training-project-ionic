import { Directive, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHideHeader]',
  host: {
    '(ionScroll)': 'onContentScroll($event)'
  }
})
export class HideHeaderDirective {
  @Input('header') header: any;

  constructor(
    private render: Renderer2,
  ) { }

  ngOnInit(){
    this.header = this.header.el;
    this.render.setStyle(this.header, 'transition', 'margin-top 700ms')
  }

  onContentScroll(e:any){
    if(e.detail.scrollTop >= 50){
      this.render.setStyle(this.header, 'margin-top', `-${ this.header.clientHeight }px`);
    }else{
      this.render.setStyle(this.header, 'margin-top', '0px');
    }
  }

}

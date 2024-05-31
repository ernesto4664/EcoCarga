import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSelected]'
})
export class SelectedDirective {
  @Input() set appSelected(isSelected: boolean) {
    if (isSelected) {
      this.renderer.addClass(this.el.nativeElement, 'selected');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'selected');
    }
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}
}